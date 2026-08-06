"use client";

import React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  count: number;
  isLiked: boolean;
  onLike: () => void;
  variant?: "post" | "comment";
  size?: "sm" | "md";
  className?: string;
}

export function LikeButton({
  count,
  isLiked,
  onLike,
  variant = "comment",
  size = "sm",
  className,
}: LikeButtonProps) {
  const iconSizeClass =
    variant === "post" ? "w-4 h-4" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      type="button"
      onClick={onLike}
      className={cn(
        "flex items-center gap-1.5 transition-colors cursor-pointer group/like-btn select-none",
        variant === "post" ? "text-xs sm:text-sm font-semibold" : "text-xs font-medium",
        isLiked
          ? "text-rose-500 font-semibold"
          : "text-muted-foreground hover:text-rose-500",
        className
      )}
      title={isLiked ? "Unlike" : "Like"}
    >
      <Heart
        className={cn(
          "transition-transform group-hover/like-btn:scale-110 active:scale-90",
          iconSizeClass,
          isLiked
            ? "fill-rose-500 text-rose-500"
            : "text-muted-foreground group-hover/like-btn:text-rose-500"
        )}
      />
      <span className={cn(isLiked ? "text-rose-500 font-semibold" : "text-muted-foreground")}>
        {count}
      </span>
    </button>
  );
}
