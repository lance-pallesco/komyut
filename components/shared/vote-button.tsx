"use client";

import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  upvoteCount: number;
  userVoteState?: "up" | "down" | null;
  onVote: (direction: "up" | "down") => void;
  orientation?: "vertical" | "horizontal";
}

export function VoteButton({
  upvoteCount,
  userVoteState,
  onVote,
  orientation = "vertical",
}: VoteButtonProps) {
  const isUpvoted = userVoteState === "up";
  const isDownvoted = userVoteState === "down";

  if (orientation === "horizontal") {
    return (
      <div className="flex items-center gap-1 bg-muted/60 dark:bg-muted/30 rounded-full px-1.5 py-0.5 border border-border/50">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-full transition-transform active:scale-95",
            isUpvoted && "bg-primary/10 text-primary hover:bg-primary/20"
          )}
          onClick={() => onVote("up")}
          aria-label="Upvote"
        >
          <ChevronUp className={cn("w-4 h-4", isUpvoted && "stroke-[2.5]")} />
        </Button>
        <span
          className={cn(
            "text-xs font-semibold px-1 min-w-[1.5rem] text-center",
            isUpvoted && "text-primary",
            isDownvoted && "text-destructive"
          )}
        >
          {upvoteCount}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-full transition-transform active:scale-95",
            isDownvoted && "bg-destructive/10 text-destructive hover:bg-destructive/20"
          )}
          onClick={() => onVote("down")}
          aria-label="Downvote"
        >
          <ChevronDown className={cn("w-4 h-4", isDownvoted && "stroke-[2.5]")} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-12 py-1 bg-muted/40 dark:bg-muted/20 rounded-lg border border-border/40 select-none">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-md transition-all active:scale-90 hover:bg-primary/10 hover:text-primary",
          isUpvoted && "bg-primary/15 text-primary"
        )}
        onClick={() => onVote("up")}
        aria-label="Upvote route question"
      >
        <ChevronUp className={cn("w-5 h-5", isUpvoted && "stroke-[2.5]")} />
      </Button>
      <span
        className={cn(
          "text-sm font-semibold my-1 text-center transition-colors",
          isUpvoted && "text-primary font-bold",
          isDownvoted && "text-destructive font-bold"
        )}
      >
        {upvoteCount}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-md transition-all active:scale-90 hover:bg-destructive/10 hover:text-destructive",
          isDownvoted && "bg-destructive/15 text-destructive"
        )}
        onClick={() => onVote("down")}
        aria-label="Downvote route question"
      >
        <ChevronDown className={cn("w-5 h-5", isDownvoted && "stroke-[2.5]")} />
      </Button>
    </div>
  );
}
