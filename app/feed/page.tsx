import { getFeedPosts } from "@/lib/db-posts";
import { FeedClientContainer } from "@/components/feed/feed-client-container";

export default async function FeedPage() {
  const initialPosts = await getFeedPosts();

  return <FeedClientContainer initialPosts={initialPosts} />;
}
