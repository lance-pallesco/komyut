"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { NAV_ITEMS } from "@/lib/constants";
import { Home, User, Bookmark, HelpCircle, Award, ShieldCheck, Sparkles, MapPin, ChevronRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  Home,
  User,
  Bookmark,
  HelpCircle,
  Award,
  ShieldCheck,
};

export function LeftSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Updated navigation list with My Profile tab
  const navList = [
    { id: "home", label: "Feed Homepage", icon: "Home", href: "/feed" },
    { id: "profile", label: "My Profile", icon: "User", href: "/profile" },
    { id: "saved", label: "Saved Routes", icon: "Bookmark", href: "/saved" },
    { id: "my-questions", label: "My Questions", icon: "HelpCircle", href: "/my-questions" },
    { id: "contributors", label: "Top Contributors", icon: "Award", href: "/leaderboard" },
    { id: "guidelines", label: "Community Rules", icon: "ShieldCheck", href: "/rules" },
  ];

  const user = session?.user;
  const userName = user?.name || (user as any)?.username || "Commuter";
  const userHandle = (user as any)?.username ? `@${(user as any).username}` : "Filipino Commuter";
  const userImage = user?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${userName}`;

  return (
    <aside className="space-y-4 select-none" aria-label="Main Navigation">
      {/* LinkedIn-Style Profile Header Card */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        {/* Cover Photo Banner Gradient */}
        <div className="h-16 w-full bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-600 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#opacity_0.15)] bg-[size:12px_12px] opacity-30" />
        </div>

        {/* Profile Details Section */}
        <div className="px-4 pb-4 text-center relative pt-0">
          {/* Avatar Ring */}
          <div className="relative inline-block -mt-9 mb-2">
            <div className="w-16 h-16 rounded-full ring-4 ring-card bg-muted overflow-hidden shadow-md flex items-center justify-center text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {status === "authenticated" ? (
                <img src={userImage} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            {status === "authenticated" && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-card" title="Active Commuter" />
            )}
          </div>

          {/* Name & Tagline */}
          {status === "authenticated" ? (
            <div className="space-y-1">
              <Link href="/profile" className="font-bold text-sm text-foreground hover:underline block truncate">
                {userName}
              </Link>
              <p className="text-[11px] font-medium text-muted-foreground truncate">
                {userHandle} • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Route Master </span>
              </p>

              {/* Stats Bar */}
              <div className="pt-3 mt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-muted/40">
                  <span className="text-xs font-bold text-foreground block">88</span>
                  <span className="text-[10px] text-muted-foreground">Verified Guides</span>
                </div>
                <div className="p-1.5 rounded-lg bg-muted/40">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">3.4k</span>
                  <span className="text-[10px] text-muted-foreground">Reputation Pts</span>
                </div>
              </div>

              {/* View Profile Button */}
              <Link
                href="/profile"
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-muted/60 hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-1 transition-all border border-border/60"
              >
                <span>View Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-foreground">Welcome to KOMYUT!</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Sign in to post questions, verify routes, and build your commuter legacy.
              </p>
              <Link
                href="/"
                className="mt-2 w-full py-2 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation List */}
      <div className="p-2 rounded-2xl border border-border/80 bg-card shadow-xs space-y-1">
        <h2 className="px-3 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
          Menu Navigation
        </h2>
        {navList.map((item) => {
          const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP] || Home;
          const isActive = pathname === item.href || (item.href === "/feed" && pathname === "/");

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                isActive
                  ? "bg-blue-900 text-white font-bold shadow-xs dark:bg-blue-800"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Link>
          );
        })}
      </div>

      {/* Commute Tip Box */}
      <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-foreground font-bold">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Tip sa Commute:</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Lagyan ng kilalang landmark ang iyong tanong para agad masagot ng kapwa commuter.
        </p>
      </div>
    </aside>
  );
}
