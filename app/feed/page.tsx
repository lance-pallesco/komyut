import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFeedPosts } from "@/lib/db-posts";
import { FeedClientContainer } from "@/components/feed/feed-client-container";
import { Suspense } from "react";

interface FeedPageProps {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    sort?: "relevant" | "latest" | "most_voted";
    region?: string;
    post?: string;
  }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  const initialPosts = await getFeedPosts({
    userId: session?.user?.id,
    query: params.q,
    tagFilter: params.tag,
    sort: params.sort,
    region: params.region,
  });

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <FeedClientContainer initialPosts={initialPosts} />
    </Suspense>
  );
}
