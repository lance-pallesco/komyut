"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6 space-y-5 select-none">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
              isDanger
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            )}
          >
            {isDanger ? (
              <Trash2 className="w-5.5 h-5.5 stroke-[2.2]" />
            ) : (
              <AlertTriangle className="w-5.5 h-5.5 stroke-[2.2]" />
            )}
          </div>

          <div className="space-y-1 min-w-0 pt-0.5">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/80 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              "px-4.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50",
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 active:scale-[0.98]"
                : "bg-primary hover:bg-primary/90 active:scale-[0.98]"
            )}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
