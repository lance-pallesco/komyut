"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { FeedTab, Region, Post } from "@/types";
import { MOCK_POSTS } from "@/lib/mock-data";
import { toggleVoteAction, toggleBookmarkAction } from "@/app/actions/vote-actions";

export function useFeedFilter(initialPosts: Post[] = MOCK_POSTS) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlQuery = searchParams.get("q") || "";
  const urlTag = searchParams.get("tag") || "";
  const urlSort = (searchParams.get("sort") as FeedTab) || "latest";

  const [activeTab, setActiveTab] = useState<FeedTab>(urlSort);
  const [activeRegion, setActiveRegion] = useState<Region>("All Regions");
  const [searchQuery, setSearchQuery] = useState<string>(urlQuery);
  const [activeTagFilter, setActiveTagFilter] = useState<string>(urlTag);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSearchQuery(urlQuery);
    setActiveTagFilter(urlTag);
    if (urlSort) setActiveTab(urlSort);
  }, [urlQuery, urlTag, urlSort]);

  useEffect(() => {
    if (initialPosts) {
      setPosts(initialPosts);
    }
  }, [initialPosts]);

  const updateUrlParams = (newParams: { q?: string; tag?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.q !== undefined) {
      if (newParams.q.trim()) params.set("q", newParams.q.trim());
      else params.delete("q");
    }

    if (newParams.tag !== undefined) {
      if (newParams.tag.trim()) params.set("tag", newParams.tag.trim());
      else params.delete("tag");
    }

    if (newParams.sort !== undefined) {
      if (newParams.sort && newParams.sort !== "latest") params.set("sort", newParams.sort);
      else params.delete("sort");
    }

    const queryString = params.toString();
    router.push(queryString ? `/feed?${queryString}` : "/feed");
  };

  const handleTabChange = (tab: FeedTab) => {
    startTransition(() => {
      setActiveTab(tab);
      updateUrlParams({ sort: tab });
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

  const handleTagFilterChange = (tag: string) => {
    startTransition(() => {
      setActiveTagFilter(tag);
      updateUrlParams({ tag });
    });
  };

  const clearSearch = () => {
    startTransition(() => {
      setSearchQuery("");
      setActiveTagFilter("");
      updateUrlParams({ q: "", tag: "" });
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
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesAnswer = post.comments?.some((c) => c.body.toLowerCase().includes(q));

        if (
          !matchesOrigin &&
          !matchesDest &&
          !matchesBody &&
          !matchesAuthor &&
          !matchesTitle &&
          !matchesAnswer
        ) {
          return false;
        }
      }

      if (activeTagFilter.trim() !== "") {
        const tagQ = activeTagFilter.toLowerCase();
        const hasTag =
          post.tags?.some((t) => t.toLowerCase() === tagQ) ||
          post.transportModes?.some((m) => m.toLowerCase() === tagQ);
        if (!hasTag) return false;
      }

      if (activeTab === "unanswered" || urlSort === "unanswered") {
        return (post.answerCount || 0) < 1 && (!post.comments || post.comments.length < 1);
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
  }, [posts, activeRegion, searchQuery, activeTagFilter, activeTab]);

  return {
    activeTab,
    activeRegion,
    searchQuery,
    activeTagFilter,
    filteredPosts,
    isLoading: isPending,
    handleTabChange,
    handleRegionChange,
    handleSearchChange,
    handleTagFilterChange,
    clearSearch,
    handleVote,
    handleBookmark,
  };
}
