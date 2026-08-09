import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSavedPosts } from "@/lib/db-posts";
import { SavedClientContainer } from "@/components/saved/saved-client-container";
import { redirect } from "next/navigation";

export default async function SavedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // If not logged in, redirect to landing page auth panel
    redirect("/");
  }

  const initialPosts = await getSavedPosts(session.user.id);

  return <SavedClientContainer initialPosts={initialPosts} />;
}
