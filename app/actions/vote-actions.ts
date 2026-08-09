"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleVoteAction(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Please log in to vote." };
    }

    const userId = session.user.id;
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let newCount = post.upvoteCount;
    let isVoted = false;

    if (existingVote) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });
      newCount = Math.max(0, post.upvoteCount - 1);
      isVoted = false;
    } else {
      await prisma.vote.create({
        data: {
          userId,
          postId,
          direction: "up",
        },
      });
      newCount = post.upvoteCount + 1;
      isVoted = true;
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        upvoteCount: newCount,
      },
    });

    revalidatePath("/feed");
    revalidatePath("/");

    return { success: true, upvoteCount: newCount, isVoted };
  } catch (error: any) {
    console.error("Error in toggleVoteAction:", error);
    return { success: false, error: error?.message || "Failed to vote." };
  }
}

export async function toggleBookmarkAction(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Please log in to save bookmarks." };
    }

    const userId = session.user.id;

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          postId,
        },
      });
    }

    revalidatePath("/feed");
    revalidatePath("/profile");

    return { success: true, isBookmarked: !existingBookmark };
  } catch (error: any) {
    console.error("Error in toggleBookmarkAction:", error);
    return { success: false, error: error?.message || "Failed to update bookmark." };
  }
}

export async function toggleAnswerVoteAction(answerId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Please log in to vote on answers." };
    }

    const userId = session.user.id;

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
    });

    if (!answer) {
      return { success: false, error: "Answer not found." };
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_answerId: {
          userId,
          answerId,
        },
      },
    });

    let newCount = answer.upvoteCount;
    let isVoted = false;

    if (existingVote) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });
      newCount = Math.max(0, answer.upvoteCount - 1);
      isVoted = false;
    } else {
      await prisma.vote.create({
        data: {
          userId,
          answerId,
          direction: "up",
        },
      });
      newCount = answer.upvoteCount + 1;
      isVoted = true;
    }

    await prisma.answer.update({
      where: { id: answerId },
      data: {
        upvoteCount: newCount,
      },
    });

    // Trigger Notification for Answer Author on Upvote
    if (isVoted && answer && answer.authorId !== userId) {
      const voter = await prisma.user.findUnique({ where: { id: userId } });
      const targetPost = await prisma.post.findUnique({ where: { id: answer.postId } });

      const voterName = voter?.name || "A commuter";
      const routeTitle = targetPost ? `"${targetPost.origin} → ${targetPost.destination}"` : "your commute guide";

      await prisma.notification.create({
        data: {
          userId: answer.authorId,
          actorId: userId,
          type: "UPVOTE",
          title: "Your guide received an upvote!",
          message: `${voterName} upvoted your commute guide on ${routeTitle}`,
          link: `/feed?post=${answer.postId}`,
          isRead: false,
        },
      });
    }

    revalidatePath("/feed");

    return { success: true, upvoteCount: newCount, isVoted };
  } catch (error: any) {
    console.error("Error in toggleAnswerVoteAction:", error);
    return { success: false, error: error?.message || "Failed to vote on answer." };
  }
}
