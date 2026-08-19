"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Bookmark, PlusCircle, Award, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostFormModal } from "@/components/post/post-form-modal";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Only display mobile bottom nav when user is LOGGED IN, and hide on landing/auth pages ("/", "/login", "/register")
  const isAuthPage = pathname === "/" || pathname === "/login" || pathname === "/register";
  if (status !== "authenticated" || isAuthPage) {
    return null;
  }

  const handlePostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPostModalOpen(true);
  };

  const items = [
    {
      label: "Home",
      icon: Home,
      href: "/feed",
      active: pathname === "/feed",
      fillOnActive: "fill-current",
    },
    {
      label: "Saved",
      icon: Bookmark,
      href: "/saved",
      active: pathname === "/saved",
      fillOnActive: "fill-current",
    },
    {
      label: "Post",
      icon: PlusCircle,
      href: "#",
      active: false,
      isCta: true,
      onClick: handlePostClick,
      fillOnActive: "fill-blue-900/20 dark:fill-blue-400/20",
    },
    {
      label: "Top Users",
      icon: Award,
      href: "/leaderboards",
      active: pathname === "/leaderboards",
      fillOnActive: "fill-current",
    },
    {
      label: "Ask",
      icon: HelpCircle,
      href: "/my-questions",
      active: pathname === "/my-questions",
      fillOnActive: "fill-blue-900/20 dark:fill-blue-400/20",
    },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-2 py-1 shadow-lg">
        <nav className="flex items-center justify-around h-12" aria-label="Mobile Navigation">
          {items.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all cursor-pointer select-none gap-0.5",
                  item.active
                    ? "text-blue-900 dark:text-blue-400 font-bold"
                    : item.isCta
                    ? "text-blue-900 dark:text-blue-400 font-bold hover:opacity-80"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-5 h-5 transition-all duration-200 active:scale-90",
                    item.isCta && "stroke-[2.5]",
                    item.active
                      ? `${item.fillOnActive} stroke-[2.25] text-blue-900 dark:text-blue-400`
                      : ""
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] leading-none tracking-tight",
                    item.active ? "font-black text-blue-900 dark:text-blue-400" : "font-semibold"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <PostFormModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        mode="create"
      />
    </>
  );
}
