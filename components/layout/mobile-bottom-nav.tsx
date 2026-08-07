"use client";

import { Home, Bookmark, PlusCircle, Award, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const items = [
    { label: "Home", icon: Home, active: true },
    { label: "Saved", icon: Bookmark, active: false },
    { label: "Post", icon: PlusCircle, active: false, isCta: true },
    { label: "Top Users", icon: Award, active: false },
    { label: "Ask", icon: HelpCircle, active: false },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-2 py-1">
      <nav className="flex items-center justify-around h-12" aria-label="Mobile Navigation">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors",
                item.isCta
                  ? "text-primary font-bold"
                  : item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <IconComponent
                className={cn(
                  "w-5 h-5 mb-0.5",
                  item.isCta && "stroke-[2.5]"
                )}
              />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
