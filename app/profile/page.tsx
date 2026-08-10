import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClientContainer } from "@/components/profile/profile-client-container";

import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic server component for fresh user session data

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const sessionUserId = (session.user as any)?.id;
  const sessionUserEmail = session?.user?.email;
  const sessionUsername = (session?.user as any)?.username;

  let dbUser = null;

  // 1. Query PostgreSQL DB specifically for the currently logged-in user
  if (sessionUserId) {
    dbUser = await prisma.user.findUnique({ where: { id: sessionUserId } });
  }

  if (!dbUser && sessionUserEmail) {
    dbUser = await prisma.user.findUnique({ where: { email: sessionUserEmail } });
  }

  if (!dbUser && sessionUsername) {
    dbUser = await prisma.user.findUnique({ where: { username: sessionUsername } });
  }

  // 2. If unauthenticated / demo mode, load active database user
  if (!dbUser) {
    dbUser = await prisma.user.findFirst();
  }

  // 3. Fallback create active user if table is empty
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: sessionUserEmail || "commuter@komyut.ph",
        username: sessionUsername || "commuter_ph",
        name: session?.user?.name || "Kōshi Sugawara",
        avatarUrl: session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        coverUrl: "",
        bio: "Naglilingkod para maging accessible ang step-by-step commute directions para sa lahat ng kapwa commuter.",
        homeArea: "Metro Manila & Cavite Transit Network",
      },
    });
  }

  const initialUser = {
    id: dbUser.id,
    name: dbUser.name,
    username: dbUser.username,
    avatarUrl: dbUser.avatarUrl,
    coverUrl: dbUser.coverUrl,
    bio: dbUser.bio,
    homeArea: dbUser.homeArea,
    reputationPoints: dbUser.reputationPoints,
    verifiedAnswersCount: dbUser.verifiedAnswersCount,
    createdAt: dbUser.createdAt.toISOString(),
  };

  return <ProfileClientContainer initialUser={initialUser} />;
}
