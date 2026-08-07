"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  MessageSquare,
  CheckCircle2,
  ThumbsUp,
  AtSign,
  CheckCheck,
} from "lucide-react";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import type { AppNotification } from "@/types";
import { cn } from "@/lib/utils";

export function NotificationPopover() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setIsOpen(false);
    if (notif.referenceId) {
      router.push(`/feed?post=${notif.referenceId}`);
    }
  };

  const getNotifIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "NEW_ANSWER":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case "ACCEPTED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />;
      case "UPVOTE":
        return <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />;
      case "MENTION":
        return <AtSign className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-primary" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-background">
                {unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent className="w-80 sm:w-96 p-0 shadow-lg rounded-2xl border-border/80" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-card rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground space-y-1">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs font-semibold">Walang abiso sa ngayon</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "w-full text-left p-3 flex items-start gap-3 transition-colors hover:bg-muted/60 cursor-pointer",
                  !n.isRead ? "bg-primary/5" : "bg-card"
                )}
              >
                {/* Actor Avatar or Type Icon */}
                <div className="relative shrink-0 mt-0.5">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={n.actor?.avatarUrl} alt={n.actor?.name || "Notification"} />
                    <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                      {n.actor?.name?.[0] || "K"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 p-0.5 bg-background rounded-full border border-border shadow-2xs">
                    {getNotifIcon(n.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-foreground truncate">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {n.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-tight">
                    {n.body}
                  </p>
                </div>

                {/* Unread Dot */}
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
