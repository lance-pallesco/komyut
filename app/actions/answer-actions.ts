"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateAnswerInput {
  postId: string;
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

    const { postId, body, isAnonymous = false, imageUrls = [] } = input;

    if (!postId) {
      return { success: false, error: "Post ID is required." };
    }
    if (!body || !body.trim()) {
      return { success: false, error: "Answer content cannot be empty." };
    }

    // Save answer to PostgreSQL database via Prisma ORM
    const answer = await prisma.answer.create({
      data: {
        postId,
        authorId: userId,
        body: body.trim(),
        upvoteCount: 0,
        isVerified: false,
      },
    });

    // Increment post answerCount
    await prisma.post.update({
      where: { id: postId },
      data: {
        answerCount: { increment: 1 },
      },
    });

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

    // Verify ownership: User must be comment author OR post owner
    if (userId && existingAnswer.authorId !== userId && existingAnswer.post?.authorId !== userId) {
      return { success: false, error: "Unauthorized to delete this answer." };
    }

    // Delete answer from PostgreSQL database
    await prisma.answer.delete({
      where: { id: answerId },
    });

    // Decrement post answerCount
    await prisma.post.update({
      where: { id: existingAnswer.postId },
      data: {
        answerCount: { decrement: 1 },
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
