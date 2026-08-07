"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdaptiveCommentInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  userImage?: string;
  userName?: string;
  placeholder?: string;
  submitButtonText?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function AdaptiveCommentInput({
  value,
  onChange,
  onSubmit,
  userImage,
  userName = "User",
  placeholder = "Write an answer or route guide...",
  submitButtonText = "Post Answer",
  isSubmitting = false,
  onCancel,
  autoFocus = false,
}: AdaptiveCommentInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userInitials = userName.substring(0, 2).toUpperCase();

  const isExpanded = isFocused || value.trim().length > 0;

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleBlur = () => {
    if (value.trim().length === 0) {
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If Shift + Enter, Ctrl + Enter, or Cmd + Enter -> Insert new line
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      return;
    }

    // Enter key alone -> Send / Submit
    if (e.key === "Enter") {
      e.preventDefault();
      if (value.trim() && !isSubmitting) {
        onSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full flex items-start gap-2.5">
      <Avatar className="h-8 w-8 border border-border shrink-0 mt-1">
        <AvatarImage src={userImage} alt={userName} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
          {userInitials}
        </AvatarFallback>
      </Avatar>

      {/* Smooth Fluid Container with CSS Height Animation */}
      <div
        className={cn(
          "flex-1 min-w-0 bg-muted/40 hover:bg-muted/60 focus-within:bg-card rounded-2xl border border-border/70 focus-within:border-primary/60 transition-all duration-300 ease-in-out p-2.5 overflow-hidden",
          isExpanded ? "shadow-2xs" : ""
        )}
      >
        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "w-full bg-transparent text-xs sm:text-sm text-foreground outline-none resize-none placeholder:text-muted-foreground/70 leading-relaxed transition-[height] duration-300 ease-in-out",
              isExpanded ? "h-20" : "h-6 pr-8"
            )}
          />

          {/* Single-line Send Icon button when compact */}
          {!isExpanded && (
            <button
              type="submit"
              disabled={!value.trim() || isSubmitting}
              className="absolute right-0 text-primary disabled:opacity-40 p-1 hover:scale-110 transition-transform cursor-pointer"
              title="Send answer"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Bar with CSS Grid Accordion height transition (100% smooth, no DOM jumps) */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out text-xs overflow-hidden",
            isExpanded
              ? "grid-rows-[1fr] opacity-100 border-t border-border/50 pt-2 mt-1.5"
              : "grid-rows-[0fr] opacity-0 border-t border-transparent pt-0 mt-0"
          )}
        >
          <div className="min-h-0 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground/70 hidden sm:inline-flex items-center gap-1">
              <span>Tip: Shift + Enter for new line</span>
            </span>

            <div className="flex items-center gap-1.5 ml-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange("");
                  setIsFocused(false);
                  onCancel?.();
                }}
                className="h-7 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!value.trim() || isSubmitting}
                size="sm"
                className="h-7 px-3.5 text-xs font-bold gap-1 rounded-xl shadow-xs cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{submitButtonText}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
