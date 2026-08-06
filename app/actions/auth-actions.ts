"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export async function registerUserAction(input: RegisterInput) {
  try {
    const { name, username, email, password } = input;

    if (!name || !name.trim()) {
      return { success: false, error: "Full Name is required." };
    }
    if (!username || !username.trim()) {
      return { success: false, error: "Username is required." };
    }
    if (!email || !email.trim()) {
      return { success: false, error: "Email address is required." };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "").trim();

    if (cleanUsername.length < 3) {
      return { success: false, error: "Username must be at least 3 alphanumeric characters." };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return { success: false, error: "An account with this email already exists." };
      }
      if (existingUser.username === cleanUsername) {
        return { success: false, error: "This username is already taken. Please choose another." };
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`;

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        avatarUrl,
        role: "user",
      },
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
      },
    };
  } catch (error: any) {
    console.error("Error in registerUserAction:", error);
    return { success: false, error: error?.message || "Failed to register user. Please try again." };
  }
}
