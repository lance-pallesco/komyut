"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateAutoTagsAction } from "./ai-actions";
import { getPostById } from "@/lib/db-posts";
import { runAIPipelineForPost } from "@/lib/ai-pipeline";

export async function getPostByIdAction(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const post = await getPostById(postId, userId);
    return { success: true, post };
  } catch (error: any) {
    console.error("Error in getPostByIdAction:", error);
    return { success: false, error: error?.message || "Failed to fetch post" };
  }
}

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
        isAnonymous: input.isAnonymous || false,
      },
    });

    const autoTagResult = await generateAutoTagsAction(
      title.trim(),
      body.trim(),
      origin.trim(),
      destination.trim(),
      selectedTagNames
    );

    if (autoTagResult.tagIds.length > 0) {
      for (const tagId of autoTagResult.tagIds) {
        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId,
          },
        });
      }
    }

    // Trigger AI embedding and suggestion retrieval in background
    runAIPipelineForPost(post.id).catch((err) => {
      console.warn("AI pipeline execution notice:", err);
    });

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

export async function toggleCommentingAction(postId: string) {
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
      return { success: false, error: "Unauthorized to modify this post." };
    }

    const nextState = !existingPost.isCommentingDisabled;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        isCommentingDisabled: nextState,
      },
    });

    revalidatePath("/feed");
    revalidatePath("/");

    return { success: true, isCommentingDisabled: updatedPost.isCommentingDisabled };
  } catch (error: any) {
    console.error("Error in toggleCommentingAction:", error);
    return { success: false, error: error?.message || "Failed to update commenting settings." };
  }
}

export interface UpdatePostInput {
  postId: string;
  title: string;
  body?: string;
  origin: string;
  destination: string;
  region?: string;
  selectedTagNames?: string[];
}

export async function updatePostAction(input: UpdatePostInput) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { postId, title, body = "", origin, destination, region = "Metro Manila", selectedTagNames = [] } = input;

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return { success: false, error: "Post not found." };
    }

    if (userId && existingPost.authorId !== userId) {
      return { success: false, error: "Unauthorized to edit this post." };
    }

    if (!title || !title.trim()) {
      return { success: false, error: "Please enter a question title." };
    }
    if (!origin || !origin.trim()) {
      return { success: false, error: "Please specify an origin location (From)." };
    }
    if (!destination || !destination.trim()) {
      return { success: false, error: "Please specify a destination location (To)." };
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title.trim(),
        body: body.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        region,
      },
    });

    if (selectedTagNames.length > 0) {
      await prisma.postTag.deleteMany({
        where: { postId },
      });

      const tags = await prisma.tag.findMany({
        where: { name: { in: selectedTagNames } },
      });

      for (const tag of tags) {
        await prisma.postTag.create({
          data: {
            postId,
            tagId: tag.id,
          },
        });
      }
    }

    revalidatePath("/feed");
    revalidatePath("/");

    return { success: true, post: updatedPost };
  } catch (error: any) {
    console.error("Error in updatePostAction:", error);
    return { success: false, error: error?.message || "Failed to update post." };
  }
}
