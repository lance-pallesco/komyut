"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostList } from "@/components/feed/post-list";
import { useFeedFilter } from "@/hooks/use-feed-filter";
import type { Post } from "@/types";
import { HelpCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostFormModal } from "@/components/post/post-form-modal";

interface MyQuestionsClientContainerProps {
  initialPosts: Post[];
}

export function MyQuestionsClientContainer({ initialPosts }: MyQuestionsClientContainerProps) {
  const filterHook = useFeedFilter(initialPosts);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

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
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">
                    My Questions
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Mga itinanong mong commute routes at petisyon sa komunidad
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsAskModalOpen(true)}
                size="sm"
                className="gap-1.5 font-bold rounded-xl shadow-xs cursor-pointer text-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Magtanong</span>
              </Button>
            </div>

            {/* Empty State vs Post List */}
            {filterHook.filteredPosts.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
                <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-600">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Wala ka pang naitatanong na commute route
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  May pupuntahan ka ba at hindi mo alam ang sakayan? I-tanong na sa aming aktibong komunidad ng mga commuter!
                </p>
                <Button
                  onClick={() => setIsAskModalOpen(true)}
                  size="sm"
                  className="mt-2 gap-1.5 font-bold rounded-full shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Magtanong sa Komunidad</span>
                </Button>
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

      <PostFormModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        mode="create"
      />
    </div>
  );
}
