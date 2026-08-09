"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";

interface UserHoverCardProps {
  author: User;
  children: React.ReactNode;
  className?: string;
}

export function UserHoverCard({ author, children, className }: UserHoverCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const loggedInUser = session?.user;

  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if author is the currently logged-in user
  const isSelf =
    !!loggedInUser &&
    ((loggedInUser as any).id === author.id ||
      (loggedInUser as any).username === author.username ||
      loggedInUser.name === author.name ||
      author.id === "usr-current");

  // If author is current logged-in user, no hover popover or redirection is needed
  if (isSelf) {
    return <div className={`inline-flex items-center ${className || ""}`}>{children}</div>;
  }

  const isAnonymous =
    author.name === "Anonymous Commuter" ||
    author.name === "Anonymous participant" ||
    author.username === "anonymous" ||
    !author.avatarUrl;

  const initials = isAnonymous
    ? "AC"
    : (author.name || "Commuter")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

  const profileHref = `/user/${author.username || author.id}`;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handleClickUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAnonymous) {
      router.push(profileHref);
    }
  };

  return (
    <div className={`relative inline-block ${className || ""}`}>
      <div
        className="cursor-pointer inline-flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClickUser}
      >
        {children}
      </div>

      {/* Hover Popover Card for Light Details */}
      {isHovered && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full left-0 mt-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {isAnonymous ? (
            /* Anonymous Popover (Matches Facebook style) */
            <div className="w-72 p-4 rounded-2xl bg-card text-card-foreground border border-border/80 shadow-2xl space-y-1.5 backdrop-blur-md select-none">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <span className="text-base">🙈</span>
                <span>Anonymous post</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This person posted anonymously without sharing their name or profile photo.
              </p>
            </div>
          ) : (
            /* Public Commuter Hover Popover Card */
            <div className="w-72 rounded-2xl bg-card text-card-foreground border border-border/80 shadow-2xl overflow-hidden backdrop-blur-md select-none">
              {/* Mini Cover Banner */}
              <div className="h-16 w-full relative overflow-hidden">
                {author.coverUrl ? (
                  <img src={author.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-blue-950 via-blue-900 to-emerald-800 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />
                  </div>
                )}
              </div>

              {/* Commuter Detail Info */}
              <div className="p-4 pt-0 relative">
                <div className="flex items-end justify-between -mt-7 mb-2">
                  <Avatar className="h-14 w-14 ring-4 ring-card shadow-md">
                    <AvatarImage src={author.avatarUrl || undefined} alt={author.name} />
                    <AvatarFallback className="font-extrabold">{initials}</AvatarFallback>
                  </Avatar>

                  <Link
                    href={profileHref}
                    onClick={(e) => e.stopPropagation()}
                    className="py-1 px-3 rounded-full bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    View Profile
                  </Link>
                </div>

                <div className="space-y-1">
                  <Link
                    href={profileHref}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-sm text-foreground hover:underline block truncate"
                  >
                    {author.name}
                  </Link>
                  <p className="text-[11px] font-medium text-muted-foreground truncate">
                    @{author.username || "commuter"} •{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {author.badge || "Route Master"}
                    </span>
                  </p>

                  {author.homeArea && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{author.homeArea}</span>
                    </div>
                  )}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-border/60 text-center text-xs">
                  <div className="p-1.5 rounded-xl bg-muted/40">
                    <span className="text-xs font-bold text-foreground block">
                      {author.verifiedAnswersCount || 88}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Verified Guides
                    </span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-muted/40">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                      {(author.reputationPoints || 3420).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Reputation Pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
