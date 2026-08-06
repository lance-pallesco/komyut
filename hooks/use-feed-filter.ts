"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import type { FeedTab, Region, Post } from "@/types";
import { MOCK_POSTS } from "@/lib/mock-data";
import { toggleVoteAction, toggleBookmarkAction } from "@/app/actions/vote-actions";

export function useFeedFilter(initialPosts: Post[] = MOCK_POSTS) {
  const [activeTab, setActiveTab] = useState<FeedTab>("latest");
  const [activeRegion, setActiveRegion] = useState<Region>("All Regions");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialPosts) {
      setPosts(initialPosts);
    }
  }, [initialPosts]);

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

  const handleVote = async (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) return post;

        const isCurrentlyLiked = post.userVoteState === "up";
        const nextVoteState = isCurrentlyLiked ? null : "up";
        const voteDiff = isCurrentlyLiked ? -1 : 1;

        return {
          ...post,
          upvoteCount: Math.max(0, post.upvoteCount + voteDiff),
          userVoteState: nextVoteState,
        };
      })
    );

    try {
      await toggleVoteAction(postId);
    } catch (err) {
      console.error("Error voting on post:", err);
    }
  };

  const handleBookmark = async (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );

    try {
      await toggleBookmarkAction(postId);
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (activeRegion !== "All Regions" && post.region !== activeRegion) {
        return false;
      }

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

      if (activeTab === "unanswered") {
        return post.answerCount === 0 || post.status === "unanswered";
      }

      return true;
    }).sort((a, b) => {
      if (a.status === "pinned" && b.status !== "pinned") return -1;
      if (b.status === "pinned" && a.status !== "pinned") return 1;

      if (activeTab === "trending") {
        return b.upvoteCount + b.answerCount * 2 - (a.upvoteCount + a.answerCount * 2);
      }

      return 0;
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
