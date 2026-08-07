"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostList } from "@/components/feed/post-list";
import { useFeedFilter } from "@/hooks/use-feed-filter";
import type { Post } from "@/types";
import { Bookmark, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedClientContainerProps {
  initialPosts: Post[];
}

export function SavedClientContainer({ initialPosts }: SavedClientContainerProps) {
  const filterHook = useFeedFilter(initialPosts);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar
        searchQuery={filterHook.searchQuery}
        onSearchChange={filterHook.handleSearchChange}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <aside className="hidden lg:block lg:col-span-3 sticky top-22">
            <LeftSidebar />
          </aside>

          <main className="col-span-1 md:col-span-8 lg:col-span-6 space-y-4">
            {/* Header Banner */}
            <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">
                    Saved Routes
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Mga na-bookmark na commute directions at gabay
                  </p>
                </div>
              </div>

              <div className="bg-muted/60 text-muted-foreground text-xs font-bold px-3 py-1 rounded-full border border-border/60">
                {filterHook.filteredPosts.length} saved
              </div>
            </div>

            {/* Empty State vs Post List */}
            {filterHook.filteredPosts.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Wala pang na-save na commute routes
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  I-click ang bookmark icon sa alinmang tanong sa feed para i-save ito para sa iyong mga susunod na biyahe!
                </p>
                <Link href="/feed">
                  <Button size="sm" className="mt-2 gap-1.5 font-bold rounded-full shadow-xs cursor-pointer">
                    <Compass className="w-4 h-4" />
                    <span>Mag-explore sa Feed Homepage</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <PostList
                posts={filterHook.filteredPosts}
                isLoading={filterHook.isLoading}
                onVote={filterHook.handleVote}
                onBookmark={filterHook.handleBookmark}
              />
            )}
          </main>

          <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-22">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
