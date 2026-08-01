"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShieldCheck, Award, MessageSquare, Heart, Bookmark, Edit, Share2, Compass, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"answers" | "questions" | "saved">("answers");
  const [searchQuery, setSearchQuery] = useState("");

  const user = session?.user;
  const userName = user?.name || (user as any)?.username || "Lance Pallesco";
  const userHandle = (user as any)?.username ? `@${(user as any).username}` : "@lancepallesco";
  const userImage = user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar Navigation & Profile Card */}
        <div className="hidden md:block md:col-span-3">
          <LeftSidebar />
        </div>

        {/* Main Center Content: Profile Header & Activity */}
        <div className="md:col-span-6 space-y-6">
          {/* Main LinkedIn-Style Profile Banner Card */}
          <Card className="rounded-3xl border-border/80 bg-card overflow-hidden shadow-xs">
            {/* Banner Cover Photo */}
            <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-blue-950 via-blue-900 to-emerald-800 relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            {/* Profile Info Row */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
                {/* Avatar with Ring */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-card bg-muted overflow-hidden shadow-lg flex items-center justify-center text-3xl font-bold text-emerald-600">
                    <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-card" title="Active Commuter" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleShareProfile} className="rounded-full gap-1.5 text-xs font-semibold">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Profile</span>
                  </Button>
                  <Button size="sm" className="rounded-full gap-1.5 text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white">
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </Button>
                </div>
              </div>

              {/* Identity & Bio */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{userName}</h1>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold gap-1 px-2.5 py-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Route Master ⚡
                  </Badge>
                </div>

                <p className="text-xs font-semibold text-muted-foreground">{userHandle} • Software Developer & Commuter Advocate</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Metro Manila & Cavite Transit Network</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  "Naglilingkod para maging accessible ang step-by-step commute directions para sa lahat ng kapwa commuter."
                </p>
              </div>

              {/* Profile Impact Stats */}
              <div className="grid grid-cols-3 gap-3 pt-5 mt-5 border-t border-border/60 text-center">
                <div className="p-3 rounded-2xl bg-muted/30">
                  <span className="text-base sm:text-lg font-black text-foreground block">3,420</span>
                  <span className="text-[11px] text-muted-foreground font-medium">Reputation Pts</span>
                </div>
                <div className="p-3 rounded-2xl bg-muted/30">
                  <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block">88</span>
                  <span className="text-[11px] text-muted-foreground font-medium">Verified Guides</span>
                </div>
                <div className="p-3 rounded-2xl bg-muted/30">
                  <span className="text-base sm:text-lg font-black text-foreground block">142</span>
                  <span className="text-[11px] text-muted-foreground font-medium">Contributions</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/80 pb-2">
              <button
                onClick={() => setActiveTab("answers")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "answers"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                Verified Guides (88)
              </button>
              <button
                onClick={() => setActiveTab("questions")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "questions"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                My Questions (12)
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "saved"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                Saved Routes (5)
              </button>
            </div>

            {/* Content List */}
            <Card className="p-5 rounded-3xl border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
                    Verified Answer
                  </Badge>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 16 Upvotes
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-900/5 dark:bg-blue-950/30 border border-blue-800/15 flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>SM North EDSA</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span>BGC High Street</span>
              </div>

              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                Mula SM North, sakay ka ng MRT-3 North Ave station tapos baba ka sa Ayala station. Mula Ayala station footbridge, tumawid ka papuntang BGC Bus Terminal. Sakay ng West Route BGC Bus, baba ka sa Bonifacio High Street.
              </p>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block md:col-span-3">
          <RightSidebar />
        </div>
      </main>
    </div>
  );
}
