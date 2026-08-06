"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Container */}
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border/80 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 fade-in-0 duration-200">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("px-6 py-4 border-b border-border/60 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn("text-lg font-bold text-foreground tracking-tight", className)}>{children}</h2>;
}

export function DialogClose({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 w-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
      aria-label="Close dialog"
    >
      <X className="w-4 h-4 stroke-[2.5]" />
    </button>
  );
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6 space-y-4 max-h-[80vh] overflow-y-auto", className)}>{children}</div>;
}
