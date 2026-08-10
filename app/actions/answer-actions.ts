"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateAnswerInput {
  postId: string;
  parentId?: string;
  body: string;
  isAnonymous?: boolean;
  imageUrls?: string[];
}

export async function createAnswerAction(input: CreateAnswerInput) {
  try {
    const session = await getServerSession(authOptions);
    let userId: string;

    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return { success: false, error: "Please log in to submit an answer." };
      }
      userId = defaultUser.id;
    }

    const { postId, parentId, body, isAnonymous = false, imageUrls = [] } = input;

    if (!postId) {
      return { success: false, error: "Post ID is required." };
    }
    if (!body || !body.trim()) {
      return { success: false, error: "Answer content cannot be empty." };
    }

    const answer = await prisma.answer.create({
      data: {
        postId,
        parentId: parentId || null,
        authorId: userId,
        body: body.trim(),
        upvoteCount: 0,
        isVerified: false,
      },
    });

    const targetPost = await prisma.post.update({
      where: { id: postId },
      data: {
        answerCount: { increment: 1 },
        status: "answered",
      },
    });

    // Trigger Notification for Post Author or Parent Comment Author
    if (parentId) {
      const parentAnswer = await prisma.answer.findUnique({
        where: { id: parentId },
      });
      if (parentAnswer && parentAnswer.authorId !== userId) {
        const answerAuthor = await prisma.user.findUnique({ where: { id: userId } });
        const actorName = isAnonymous ? "Someone" : (answerAuthor?.name || "A commuter");

        await prisma.notification.create({
          data: {
            userId: parentAnswer.authorId,
            actorId: isAnonymous ? null : userId,
            type: "NEW_ANSWER",
            title: "New reply to your comment",
            message: `${actorName} replied to your comment on "${targetPost.origin} → ${targetPost.destination}"`,
            link: `/feed?post=${postId}`,
            isRead: false,
          },
        });
      }
    } else if (targetPost && targetPost.authorId !== userId) {
      const answerAuthor = await prisma.user.findUnique({ where: { id: userId } });
      const actorName = isAnonymous ? "Someone" : (answerAuthor?.name || "A commuter");

      await prisma.notification.create({
        data: {
          userId: targetPost.authorId,
          actorId: isAnonymous ? null : userId,
          type: "NEW_ANSWER",
          title: "New Answer on your post",
          message: `${actorName} answered your question: "${targetPost.origin} → ${targetPost.destination}"`,
          link: `/feed?post=${postId}`,
          isRead: false,
        },
      });
    }

    revalidatePath("/feed");
    revalidatePath(`/post/${postId}`);

    return { success: true, answer };
  } catch (error: any) {
    console.error("Error in createAnswerAction:", error);
    return { success: false, error: error?.message || "Failed to submit answer." };
  }
}

export async function deleteAnswerAction(answerId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const existingAnswer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { post: true },
    });

    if (!existingAnswer) {
      return { success: false, error: "Answer not found." };
    }

    if (userId && existingAnswer.authorId !== userId && existingAnswer.post?.authorId !== userId) {
      return { success: false, error: "Unauthorized to delete this answer." };
    }
    
    await prisma.answer.delete({
      where: { id: answerId },
    });
    
    const remainingAnswerCount = await prisma.answer.count({
      where: { postId: existingAnswer.postId },
    });

    await prisma.post.update({
      where: { id: existingAnswer.postId },
      data: {
        answerCount: remainingAnswerCount,
        status: remainingAnswerCount < 1 ? "unanswered" : "answered",
      },
    });

    revalidatePath("/feed");
    revalidatePath(`/post/${existingAnswer.postId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteAnswerAction:", error);
    return { success: false, error: error?.message || "Failed to delete answer." };
  }
}
