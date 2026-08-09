"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, User, Bookmark, HelpCircle, Award, ShieldCheck, Sparkles, ChevronRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopContributors } from "@/components/sidebar/top-contributors";
import { MOCK_TOP_CONTRIBUTORS } from "@/lib/mock-data";
import { useUserProfile } from "@/components/providers/user-profile-provider";
import { getUserProfileAction } from "@/app/actions/user-actions";

const ICON_MAP = {
  Home,
  User,
  Bookmark,
  HelpCircle,
  Award,
  ShieldCheck,
};

interface LeftSidebarProps {
  profileData?: {
    name?: string;
    username?: string;
    avatarUrl?: string;
    coverUrl?: string;
  };
}

export function LeftSidebar({ profileData: propProfile }: LeftSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { profile: contextProfile } = useUserProfile();

  const user = session?.user;

  // Local live profile state synced via propProfile, contextProfile, or session/DB
  const [liveProfile, setLiveProfile] = useState({
    name: propProfile?.name || contextProfile?.name || user?.name || "Kōshi Sugawara",
    username: propProfile?.username || contextProfile?.username || (user as any)?.username || "kshisugawara9553",
    avatarUrl: propProfile?.avatarUrl || contextProfile?.avatarUrl || user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    coverUrl: propProfile?.coverUrl || contextProfile?.coverUrl || "",
  });

  // Sync with contextProfile or propProfile changes reactively
  useEffect(() => {
    const active = propProfile || contextProfile;
    if (active) {
      setLiveProfile((prev) => ({
        ...prev,
        ...(active.name ? { name: active.name } : {}),
        ...(active.username ? { username: active.username } : {}),
        ...(active.avatarUrl !== undefined ? { avatarUrl: active.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" } : {}),
        ...(active.coverUrl !== undefined ? { coverUrl: active.coverUrl || "" } : {}),
      }));
    }
  }, [propProfile, contextProfile]);

  useEffect(() => {
    async function loadDbUser() {
      const res = await getUserProfileAction(user?.email || (user as any)?.username);
      if (res.success && res.user) {
        setLiveProfile((prev) => ({
          ...prev,
          name: res.user.name || prev.name,
          username: res.user.username || prev.username,
          avatarUrl: res.user.avatarUrl || prev.avatarUrl,
          coverUrl: res.user.coverUrl || prev.coverUrl,
        }));
      }
    }

    if (!propProfile && !contextProfile) {
      loadDbUser();
    }
  }, [user, propProfile, contextProfile]);

  const navList = [
    { id: "home", label: "Feed Homepage", icon: "Home", href: "/feed" },
    { id: "profile", label: "My Profile", icon: "User", href: "/profile" },
    { id: "saved", label: "Saved Routes", icon: "Bookmark", href: "/saved" },
    { id: "my-questions", label: "My Questions", icon: "HelpCircle", href: "/my-questions" },
    { id: "contributors", label: "Top Contributors", icon: "Award", href: "/leaderboards" },
    { id: "guidelines", label: "Community Rules", icon: "ShieldCheck", href: "/rules" },
  ];

  const userName = liveProfile.name;
  const userHandle = `@${liveProfile.username}`;
  const userAvatar = liveProfile.avatarUrl;
  const userCover = liveProfile.coverUrl;

  return (
    <aside className="space-y-4 select-none" aria-label="Main Navigation">
      {/* LinkedIn-Style Profile Header Card */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        {/* Cover Photo Banner (Reflects instantly when cover is updated!) */}
        <div className="h-16 w-full relative overflow-hidden">
          {userCover ? (
            <img src={userCover} alt="Cover Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-600 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#opacity_0.15)] bg-[size:12px_12px] opacity-30" />
            </div>
          )}
        </div>

        {/* Profile Details Section */}
        <div className="px-4 pb-4 text-center relative pt-0">
          {/* Avatar Ring (Reflects instantly when avatar is updated!) */}
          <div className="relative inline-block -mt-9 mb-2">
            <div className="w-16 h-16 rounded-full ring-4 ring-card bg-muted overflow-hidden shadow-md flex items-center justify-center text-lg font-bold text-emerald-600 dark:text-emerald-400">
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-card" title="Active Commuter" />
          </div>

          {/* Name & Tagline (Reflects instantly when name is updated!) */}
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

      {/* Top Route Contributors Card (Mobile PWA Optimized - Top 3) */}
      <TopContributors
        contributors={MOCK_TOP_CONTRIBUTORS}
        maxItems={3}
        onSeeAll={() => router.push("/leaderboards")}
      />

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
