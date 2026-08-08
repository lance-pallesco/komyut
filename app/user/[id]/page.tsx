import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicProfileClientContainer } from "@/components/profile/public-profile-client-container";

export const revalidate = 0;

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { id } = await params;
  const cleanId = decodeURIComponent(id).trim().toLowerCase().replace(/^@/, "");

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: cleanId },
        { id: cleanId },
      ],
    },
  });

  if (!user) {
    return notFound();
  }

  const publicUserData = {
    id: user.id,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl,
    bio: user.bio,
    homeArea: user.homeArea,
    reputationPoints: user.reputationPoints,
    verifiedAnswersCount: user.verifiedAnswersCount,
  };

  return <PublicProfileClientContainer user={publicUserData} />;
}
