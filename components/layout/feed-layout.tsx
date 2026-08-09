"use client";

import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { CreatePostBox } from "@/components/feed/create-post-box";
import { RegionFilter } from "@/components/feed/region-filter";
import { PostList } from "@/components/feed/post-list";
import { useFeedFilter } from "@/hooks/use-feed-filter";

import { PostDetailModal } from "@/components/post/post-detail-modal";

interface FeedLayoutProps {
  filterHook: ReturnType<typeof useFeedFilter>;
}

export function FeedLayout({ filterHook }: FeedLayoutProps) {
  const {
    activeRegion,
    searchQuery,
    activeTagFilter,
    targetPostId,
    modalPost,
    isModalLoading,
    filteredPosts,
    isLoading,
    handleRegionChange,
    handleSearchChange,
    handleTagFilterChange,
    handleClearPostFilter,
    handleVote,
    handleBookmark,
  } = filterHook;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
      {/* Target Post Detail Modal for Notification Redirects */}
      <PostDetailModal
        post={modalPost}
        isOpen={!!targetPostId}
        isLoading={isModalLoading}
        onClose={handleClearPostFilter}
        onVote={handleVote}
        onBookmark={handleBookmark}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <aside className="hidden lg:block lg:col-span-3 sticky top-22">
          <LeftSidebar />
        </aside>

        <main className="col-span-1 md:col-span-8 lg:col-span-6 space-y-4">
          <CreatePostBox />
          <RegionFilter
            activeRegion={activeRegion}
            onRegionChange={handleRegionChange}
            activeTagFilter={activeTagFilter}
            onClearTag={() => handleTagFilterChange("")}
          />
          <PostList
            posts={filteredPosts}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onVote={handleVote}
            onBookmark={handleBookmark}
          />
        </main>

        <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-22">
          <RightSidebar
            onRouteClick={(origin, dest) => {
              handleSearchChange(`${origin} ${dest}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
