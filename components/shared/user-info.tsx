import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2 } from "lucide-react";

interface UserInfoProps {
  author: User;
  createdAt: string;
  isVerified?: boolean;
}

export function UserInfo({ author, createdAt, isVerified }: UserInfoProps) {
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2.5 select-none">
      <Avatar className="h-9 w-9 border border-border/60 shrink-0">
        <AvatarImage src={author.avatarUrl} alt={author.name} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-xs sm:text-sm text-foreground hover:underline cursor-pointer leading-tight truncate">
            {author.name}
          </span>
          {author.badge && (
            <span className="hidden sm:inline-block text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
              {author.badge}
            </span>
          )}
          {isVerified && (
            <span title="Verified Route Guide" className="inline-flex items-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/10" />
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground/80 font-normal leading-tight mt-0.5">
          {createdAt}
        </span>
      </div>
    </div>
  );
}
