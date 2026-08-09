"use client";

import { Dialog, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { PostCard } from "@/components/feed/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@/types";
import { MessageSquare } from "lucide-react";

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onVote: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

function PostModalSkeleton() {
  return (
    <div className="p-4 sm:p-5">
      <div className="p-4 sm:p-5 border border-border/70 rounded-2xl bg-card space-y-4 animate-in fade-in-0 duration-200">
        {/* Author Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>

        {/* Question Title & Description */}
        <div className="space-y-2 pt-1">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div>

        {/* Origin -> Destination Route Pill */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>

        {/* Transport Tag Badge */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Actions (Vote / Comment Counts) */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-10 rounded-md" />
            <Skeleton className="h-5 w-10 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-md" />
          </div>
        </div>

        {/* Answer/Comment Box Placeholder */}
        <div className="pt-3 border-t border-border/50 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-4/5 rounded-md" />
            </div>
          </div>

          {/* Comment Input Box */}
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-9 flex-1 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostDetailModal({
  post,
  isOpen,
  isLoading = false,
  onClose,
  onVote,
  onBookmark,
}: PostDetailModalProps) {
  if (!isOpen) return null;

  const showSkeleton = isLoading || !post;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="max-w-xl sm:max-w-2xl md:max-w-3xl flex flex-col max-h-[90vh]"
    >
      <DialogHeader className="bg-muted/30 shrink-0">
        <DialogTitle className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-foreground">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Question Discussion</span>
        </DialogTitle>
        <DialogClose onClick={onClose} />
      </DialogHeader>

      <div className="flex-1 overflow-y-auto">
        {showSkeleton ? (
          <PostModalSkeleton />
        ) : (
          <div className="p-4 sm:p-5">
            <PostCard
              post={post}
              isHighlighted={true}
              onVote={onVote}
              onBookmark={onBookmark}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
