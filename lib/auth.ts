import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "demo_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo_google_client_secret",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "demo_facebook_client_id",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "demo_facebook_client_secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          throw new Error("Please enter both email/username and password.");
        }

        const identifier = credentials.emailOrUsername.toLowerCase().trim();

        // Search user by email or username
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { username: identifier },
            ],
          },
        });

        if (!dbUser || !dbUser.passwordHash) {
          throw new Error("No user found with these credentials.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, dbUser.passwordHash);
        if (!isPasswordValid) {
          throw new Error("Invalid password. Please try again.");
        }

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          username: dbUser.username,
          image: dbUser.avatarUrl,
          role: dbUser.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!user.email) return false;

        // Check if user already exists in DB
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Generate unique username from name or email prefix
          const baseUsername = (user.name || user.email.split("@")[0])
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
          const uniqueUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

          // Create first-time user record in DB on OAuth login
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "Commuter",
              username: uniqueUsername,
              avatarUrl: user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${uniqueUsername}`,
              role: "user",
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role || "user";
      } else if (token.email && !token.username) {
        // Hydrate from DB only once if username is missing from token
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.picture = dbUser.avatarUrl || token.picture;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        session.user.image = token.picture || session.user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "komyut_super_secret_key_2026",
};
