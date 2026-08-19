"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, ThumbsUp, ThumbsDown, ExternalLink, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { rateAISuggestionAction } from "@/app/actions/ai-actions";
import type { AISuggestion } from "@/types";
import { cn } from "@/lib/utils";

interface AISuggestionCardProps {
  suggestion: AISuggestion;
}

export function AISuggestionCard({ suggestion }: AISuggestionCardProps) {
  const [helpfulState, setHelpfulState] = useState<boolean | null>(suggestion.wasHelpful ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answer = suggestion.answer;
  if (!answer) return null;

  const handleRating = async (wasHelpful: boolean) => {
    if (isSubmitting || helpfulState === wasHelpful) return;
    setHelpfulState(wasHelpful);
    setIsSubmitting(true);

    try {
      await rateAISuggestionAction(suggestion.id, wasHelpful);
      toast.success(
        wasHelpful
          ? "Salamat! Marked as helpful community guide."
          : "Salamat sa feedback! We will refine future route suggestions."
      );
    } catch (err) {
      console.error("Error submitting rating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tierConfig = {
    VERIFIED: {
      badgeText: "AI Note: Community-Confirmed Answer",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      borderClass: "border-emerald-500/30 dark:border-emerald-500/20",
      icon: CheckCircle2,
      subText: "This route has been heavily confirmed and upvoted by local commuters.",
    },
    LIKELY: {
      badgeText: "AI Note: Similar Past Answer",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      borderClass: "border-blue-500/30 dark:border-blue-500/20",
      icon: Sparkles,
      subText: "Matches a previously answered question — not yet heavily confirmed.",
    },
    UNCONFIRMED: {
      badgeText: "AI Note: Unconfirmed Commute Route",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      borderClass: "border-amber-500/30 dark:border-amber-500/20",
      icon: ShieldAlert,
      subText: "Someone answered a similar question — please verify landmarks before traveling.",
    },
  }[suggestion.confidenceTier || "LIKELY"];

  const TierIcon = tierConfig.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5 space-y-3.5 shadow-xs transition-all",
        "bg-gradient-to-br from-blue-50/40 via-card to-emerald-50/20 dark:from-blue-950/20 dark:via-card dark:to-emerald-950/10",
        tierConfig.borderClass
      )}
    >
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn("px-2.5 py-1 text-xs font-bold gap-1.5 rounded-lg shadow-2xs", tierConfig.badgeClass)}
          >
            <Lightbulb className="w-3.5 h-3.5 fill-current text-amber-500 dark:text-amber-400" />
            <span>{tierConfig.badgeText}</span>
          </Badge>

          {suggestion.isCrossMode && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] font-semibold"
            >
              Alternative Transport Mode
            </Badge>
          )}
        </div>

        {suggestion.sourcePostId && (
          <Link
            href={`/post/${suggestion.sourcePostId}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 dark:text-blue-400 hover:underline shrink-0"
          >
            <span>Original Thread</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Cross-Mode Explanation Notice */}
      {suggestion.isCrossMode && (
        <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50">
          💡 <strong>Notice:</strong> This suggested route uses an alternative transport mode (e.g. MRT/Bus) because no exact mode match was available yet.
        </p>
      )}

      {/* Answer Content Quote */}
      <div className="space-y-2 bg-card/80 dark:bg-card/50 p-3.5 rounded-xl border border-border/60">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7 border border-border shrink-0">
            <AvatarImage src={answer.author.avatarUrl} alt={answer.author.name} />
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
              {(answer.author.name || "C").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-foreground">{answer.author.name}</span>
            <span className="text-[10px] text-muted-foreground">• Contributed Answer</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line pl-1">
          {answer.body}
        </p>
      </div>

      {/* Footer & Feedback Action Loop */}
      <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 text-[11px]">
          <TierIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">{tierConfig.subText}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-medium hidden sm:inline">Was this helpful?</span>
          <Button
            type="button"
            variant={helpfulState === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleRating(true)}
            disabled={isSubmitting}
            className={cn(
              "h-7 px-2.5 text-xs gap-1 rounded-lg cursor-pointer",
              helpfulState === true && "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>Yes</span>
          </Button>

          <Button
            type="button"
            variant={helpfulState === false ? "destructive" : "outline"}
            size="sm"
            onClick={() => handleRating(false)}
            disabled={isSubmitting}
            className="h-7 px-2.5 text-xs gap-1 rounded-lg cursor-pointer"
          >
            <ThumbsDown className="w-3 h-3" />
            <span>No</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
