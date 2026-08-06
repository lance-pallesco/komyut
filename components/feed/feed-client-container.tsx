"use client";

import { Navbar } from "@/components/layout/navbar";
import { FeedLayout } from "@/components/layout/feed-layout";
import { useFeedFilter } from "@/hooks/use-feed-filter";
import type { Post } from "@/types";

export function FeedClientContainer({ initialPosts }: { initialPosts: Post[] }) {
  const filterHook = useFeedFilter(initialPosts);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar
        searchQuery={filterHook.searchQuery}
        onSearchChange={filterHook.handleSearchChange}
      />
      <FeedLayout filterHook={filterHook} />
    </div>
  );
}
