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

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const baseUsername = (user.name || user.email.split("@")[0])
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
          const uniqueUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

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

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role || "user";
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.picture = dbUser.avatarUrl || token.picture;
          (token as any).coverUrl = dbUser.coverUrl || "";
          // Account created within the last 45 seconds = New User
          token.isNewUser = Date.now() - new Date(dbUser.createdAt).getTime() < 45000;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        if (token.name) {
          session.user.name = token.name as string;
        }
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).isNewUser = token.isNewUser || false;
        (session.user as any).coverUrl = (token as any).coverUrl || "";
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
