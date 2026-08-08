"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface UpdateProfileInput {
  userId?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  homeArea?: string;
}

export async function checkUsernameAvailabilityAction(
  username: string,
  currentUsername: string
): Promise<{ available: boolean; reason?: string }> {
  const cleaned = username.trim().toLowerCase().replace(/^@/, "");

  if (!cleaned) {
    return { available: false, reason: "Username cannot be empty" };
  }

  if (cleaned.length < 3) {
    return { available: false, reason: "Username must be at least 3 characters" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
    return { available: false, reason: "Username can only contain letters, numbers, and underscores" };
  }

  if (cleaned === currentUsername.toLowerCase().replace(/^@/, "")) {
    return { available: true };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { username: cleaned },
    });
    if (existing && existing.username !== currentUsername) {
      return { available: false, reason: `@${cleaned} is already taken by another user` };
    }
  } catch (err: any) {
    console.error("Database error during username check:", err);
    return { available: false, reason: "Could not verify username availability with database" };
  }

  return { available: true };
}

export async function getUserProfileAction(query?: string) {
  try {
    let user = null;
    if (query) {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ id: query }, { username: query }, { email: query }],
        },
      });
    }

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return { success: false, error: "User profile not found in database" };
    }

    return { success: true, user };
  } catch (err: any) {
    console.error("Error fetching user profile:", err);
    return { success: false, error: err.message || "Failed to fetch user profile" };
  }
}

export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    if (input.username) {
      const cleanUsername = input.username.trim().toLowerCase().replace(/^@/, "");
      const check = await checkUsernameAvailabilityAction(cleanUsername, input.username);
      if (!check.available) {
        return { success: false, error: check.reason || "Username unavailable" };
      }
    }

    const updateData: Record<string, any> = {};
    if (input.name) {
      if (/\d/.test(input.name)) {
        return { success: false, error: "Full Name cannot contain numbers." };
      }
      updateData.name = input.name;
    }
    if (input.username) updateData.username = input.username.trim().toLowerCase().replace(/^@/, "");
    if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;
    if (input.coverUrl !== undefined) updateData.coverUrl = input.coverUrl;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.homeArea !== undefined) updateData.homeArea = input.homeArea;

    let targetUser = null;
    if (input.userId) {
      targetUser = await prisma.user.findUnique({ where: { id: input.userId } });
    }

    if (!targetUser) {
      targetUser = await prisma.user.findFirst();
    }

    if (!targetUser) {
      return { success: false, error: "User record not found in database for update" };
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: updateData,
    });

    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error("Database error updating profile:", error);
    return { success: false, error: error.message || "Database update failed" };
  }
}
