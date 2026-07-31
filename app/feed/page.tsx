"use client";

import { Navbar } from "@/components/layout/navbar";
import { FeedLayout } from "@/components/layout/feed-layout";
import { useFeedFilter } from "@/hooks/use-feed-filter";

export default function FeedPage() {
  const filterHook = useFeedFilter();

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
