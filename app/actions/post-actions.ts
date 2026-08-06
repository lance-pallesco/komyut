"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreatePostInput {
  title: string;
  body?: string;
  origin: string;
  destination: string;
  region?: string;
  isAnonymous?: boolean;
  selectedTagNames?: string[];
}

export async function createPostAction(input: CreatePostInput) {
  try {
    const session = await getServerSession(authOptions);
    let authorId: string;

    if (session?.user?.id) {
      authorId = session.user.id;
    } else {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return { success: false, error: "Please log in to post a question." };
      }
      authorId = defaultUser.id;
    }

    const { title, body = "", origin, destination, region = "Metro Manila", selectedTagNames = [] } = input;

    if (!title || !title.trim()) {
      return { success: false, error: "Please enter a question title." };
    }
    if (!body || !body.trim()) {
      return { success: false, error: "Please describe your commute post details." };
    }
    if (!origin || !origin.trim()) {
      return { success: false, error: "Please specify an origin location (From)." };
    }
    if (!destination || !destination.trim()) {
      return { success: false, error: "Please specify a destination location (To)." };
    }

    const post = await prisma.post.create({
      data: {
        authorId,
        title: title.trim(),
        body: body.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        region,
        status: "unanswered",
        upvoteCount: 0,
        answerCount: 0,
      },
    });

    if (selectedTagNames.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { name: { in: selectedTagNames } },
      });

      for (const tag of tags) {
        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: tag.id,
          },
        });
      }
    }

    revalidatePath("/feed");
    revalidatePath("/");

    return { success: true, post };
  } catch (error: any) {
    console.error("Error in createPostAction:", error);
    return { success: false, error: error?.message || "Failed to create post. Please try again." };
  }
}

export async function deletePostAction(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return { success: false, error: "Post not found." };
    }

    if (userId && existingPost.authorId !== userId) {
      return { success: false, error: "Unauthorized to delete this post." };
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/feed");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error in deletePostAction:", error);
    return { success: false, error: error?.message || "Failed to delete post." };
  }
}
