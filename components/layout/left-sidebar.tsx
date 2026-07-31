"use client";

import { NAV_ITEMS } from "@/lib/constants";
import { Home, Bookmark, HelpCircle, Award, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  Home,
  Bookmark,
  HelpCircle,
  Award,
  ShieldCheck,
};

export function LeftSidebar() {
  return (
    <nav className="space-y-6 select-none" aria-label="Main Navigation">
      <div className="space-y-1">
        <h2 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Menu Navigation
        </h2>
        {NAV_ITEMS.map((item) => {
          const IconComponent =
            ICON_MAP[item.icon as keyof typeof ICON_MAP] || Home;

          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group",
                item.active
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <IconComponent
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                  item.active ? "text-primary-foreground" : "text-muted-foreground"
                )}
              />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>

      <div className="px-3 pt-4 border-t border-border/60">
        <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-[11px] space-y-1.5">
          <p className="font-semibold text-foreground">💡 Tip sa Commute:</p>
          <p className="text-muted-foreground leading-relaxed">
            Lagyan ng kilalang landmark ang iyong tanong para agad masagot ng kapwa commuter.
          </p>
        </div>
      </div>
    </nav>
  );
}
