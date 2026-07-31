import type { PostStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Pin, HelpCircle, MessageSquare } from "lucide-react";

interface StatusBadgeProps {
  status: PostStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "pinned":
      return (
        <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 gap-1 text-[11px] font-medium">
          <Pin className="w-3 h-3 fill-current" />
          Pinned Guide
        </Badge>
      );
    case "verified":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px] font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified Route
        </Badge>
      );
    case "unanswered":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 gap-1 text-[11px] font-medium"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Kailangan ng Sagot
        </Badge>
      );
    case "answered":
    default:
      return (
        <Badge
          variant="secondary"
          className="bg-muted text-muted-foreground gap-1 text-[11px] font-medium"
        >
          <MessageSquare className="w-3 h-3" />
          May Sagot Na
        </Badge>
      );
  }
}
