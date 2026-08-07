import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFeedPosts } from "@/lib/db-posts";
import { FeedClientContainer } from "@/components/feed/feed-client-container";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  const initialPosts = await getFeedPosts(session?.user?.id);

  return <FeedClientContainer initialPosts={initialPosts} />;
}
