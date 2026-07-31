"use client";

import { useState, useMemo, useTransition } from "react";
import type { FeedTab, Region, Post } from "@/types";
import { MOCK_POSTS } from "@/lib/mock-data";

export function useFeedFilter() {
  const [activeTab, setActiveTab] = useState<FeedTab>("latest");
  const [activeRegion, setActiveRegion] = useState<Region>("All Regions");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: FeedTab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const handleRegionChange = (region: Region) => {
    startTransition(() => {
      setActiveRegion(region);
    });
  };

  const handleSearchChange = (query: string) => {
    startTransition(() => {
      setSearchQuery(query);
    });
  };

  const handleVote = (postId: string, direction: "up" | "down") => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) return post;

        const currentVote = post.userVoteState;
        let newVote: "up" | "down" | null = direction;
        let voteDiff = 0;

        if (currentVote === direction) {
          newVote = null;
          voteDiff = direction === "up" ? -1 : 1;
        } else if (currentVote === null) {
          voteDiff = direction === "up" ? 1 : -1;
        } else {
          voteDiff = direction === "up" ? 2 : -2;
        }

        return {
          ...post,
          upvoteCount: post.upvoteCount + voteDiff,
          userVoteState: newVote,
        };
      })
    );
  };

  const handleBookmark = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Region filter
      if (activeRegion !== "All Regions" && post.region !== activeRegion) {
        return false;
      }

      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesOrigin = post.origin.toLowerCase().includes(q);
        const matchesDest = post.destination.toLowerCase().includes(q);
        const matchesBody = post.body.toLowerCase().includes(q);
        const matchesAuthor = post.author.name.toLowerCase().includes(q);
        if (!matchesOrigin && !matchesDest && !matchesBody && !matchesAuthor) {
          return false;
        }
      }

      // Tab filter
      if (activeTab === "unanswered") {
        return post.answerCount === 0 || post.status === "unanswered";
      }

      return true;
    }).sort((a, b) => {
      // Pinned posts always stay on top
      if (a.status === "pinned" && b.status !== "pinned") return -1;
      if (b.status === "pinned" && a.status !== "pinned") return 1;

      if (activeTab === "trending") {
        return b.upvoteCount + b.answerCount * 2 - (a.upvoteCount + a.answerCount * 2);
      }

      return 0; // Default order
    });
  }, [posts, activeRegion, searchQuery, activeTab]);

  return {
    activeTab,
    activeRegion,
    searchQuery,
    filteredPosts,
    isLoading: isPending,
    handleTabChange,
    handleRegionChange,
    handleSearchChange,
    handleVote,
    handleBookmark,
  };
}
