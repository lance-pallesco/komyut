import type { Post } from "@/types";
import { PostCard } from "./post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostListProps {
  posts: Post[];
  isLoading?: boolean;
  onVote: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

export function PostList({
  posts,
  isLoading = false,
  onVote,
  onBookmark,
}: PostListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-border bg-card space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl bg-card/50 space-y-3">
        <div className="inline-flex p-3 rounded-full bg-muted text-muted-foreground">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Walang nahanap na tanong sa rehiyon na ito
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Subukan palitan ang rehiyon filter o mag-post ng unang tanong para matulungan ng komunidad!
        </p>
        <Button size="sm" className="mt-2 gap-1.5">
          <HelpCircle className="w-4 h-4" />
          Magtanong ng Commute Route
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onVote={onVote}
          onBookmark={onBookmark}
        />
      ))}
    </div>
  );
}
