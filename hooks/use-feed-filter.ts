"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import type { FeedTab, Region, Post } from "@/types";
import { MOCK_POSTS } from "@/lib/mock-data";

export function useFeedFilter(initialPosts: Post[] = MOCK_POSTS) {
  const [activeTab, setActiveTab] = useState<FeedTab>("latest");
  const [activeRegion, setActiveRegion] = useState<Region>("All Regions");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      setPosts(initialPosts);
    }
  }, [initialPosts]);

  useEffect(() => {
    // Rehydrate user-created posts from localStorage on initial mount
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("komyut_user_posts");
        if (saved) {
          const parsedPosts: Post[] = JSON.parse(saved);
          if (Array.isArray(parsedPosts) && parsedPosts.length > 0) {
            setPosts((prevPosts) => {
              const existingIds = new Set(prevPosts.map((p) => p.id));
              const uniqueSaved = parsedPosts.filter((p) => !existingIds.has(p.id));
              return [...uniqueSaved, ...prevPosts];
            });
          }
        }
      } catch (e) {
        console.error("Error rehydrating saved posts:", e);
      }
    }

    const handleNewPost = (event: Event) => {
      const customEvent = event as CustomEvent<Post>;
      if (customEvent.detail) {
        const newPost = customEvent.detail;
        setPosts((prevPosts) => {
          const updated = [newPost, ...prevPosts.filter((p) => p.id !== newPost.id)];
          if (typeof window !== "undefined") {
            try {
              const saved = localStorage.getItem("komyut_user_posts");
              const parsed: Post[] = saved ? JSON.parse(saved) : [];
              const filtered = parsed.filter((p) => p.id !== newPost.id);
              localStorage.setItem("komyut_user_posts", JSON.stringify([newPost, ...filtered]));
            } catch (e) {
              console.error("Failed to persist post to localStorage:", e);
            }
          }
          return updated;
        });
      }
    };

    const handleUpdateComments = (event: Event) => {
      const customEvent = event as CustomEvent<{ postId: string; comments: any[]; answerCount?: number }>;
      if (customEvent.detail) {
        const { postId, comments, answerCount } = customEvent.detail;
        setPosts((prevPosts) => {
          const updated = prevPosts.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments,
              answerCount: answerCount !== undefined ? answerCount : comments.length,
            };
          });

          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("komyut_user_posts", JSON.stringify(updated));
            } catch (e) {
              console.error("Failed to persist updated comments:", e);
            }
          }
          return updated;
        });
      }
    };

    window.addEventListener("komyut:new-post", handleNewPost);
    window.addEventListener("komyut:update-comments", handleUpdateComments);
    return () => {
      window.removeEventListener("komyut:new-post", handleNewPost);
      window.removeEventListener("komyut:update-comments", handleUpdateComments);
    };
  }, []);

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
    setPosts((currentPosts) => {
      const updated = currentPosts.map((post) => {
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
          upvoteCount: Math.max(0, post.upvoteCount + voteDiff),
          userVoteState: newVote,
        };
      });

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("komyut_user_posts", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to persist vote state:", e);
        }
      }
      return updated;
    });
  };

  const handleBookmark = (postId: string) => {
    setPosts((currentPosts) => {
      const updated = currentPosts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("komyut_user_posts", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to persist bookmark state:", e);
        }
      }
      return updated;
    });
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
