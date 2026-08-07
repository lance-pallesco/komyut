"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, CheckCircle2, Crown, Sparkles, TrendingUp } from "lucide-react";
import { MOCK_TOP_CONTRIBUTORS } from "@/lib/mock-data";
import { formatNumber } from "@/lib/formatters";

export function LeaderboardClientContainer() {
  const topThree = MOCK_TOP_CONTRIBUTORS.slice(0, 3);
  const remaining = MOCK_TOP_CONTRIBUTORS.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <aside className="hidden lg:block lg:col-span-3 sticky top-22">
            <LeftSidebar />
          </aside>

          <main className="col-span-1 md:col-span-8 lg:col-span-6 space-y-4">
            {/* Header Banner */}
            <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-extrabold text-lg sm:text-xl text-foreground tracking-tight flex items-center gap-2">
                    <span>Top Route Contributors</span>
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Mga Bayani ng Commute sa Komunidad ng Pilipinas
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
                Sila ang mga commuter na nagbabahagi ng pinakamaraming verified directions, subok na sakayan, at kapaki-pakinabang na gabay sa biyahe araw-araw.
              </p>
            </div>

            {/* Top 3 Podium Showcase */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* Rank 2 (Silver) */}
              {topThree[1] && (
                <div className="bg-card p-3 rounded-2xl border border-border/80 shadow-xs text-center flex flex-col items-center justify-between space-y-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-xs font-bold text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded-full border border-slate-400/20">
                    🥈 #2
                  </div>
                  <Avatar className="h-12 w-12 border-2 border-slate-300 shadow-xs mt-2">
                    <AvatarImage src={topThree[1].user.avatarUrl} alt={topThree[1].user.name} />
                    <AvatarFallback className="font-bold text-xs bg-slate-100 text-slate-700">
                      {topThree[1].user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-foreground truncate max-w-[90px] sm:max-w-full">
                      {topThree[1].user.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {topThree[1].user.verifiedAnswersCount} verified guides
                    </span>
                  </div>
                  <div className="bg-slate-500/10 text-slate-700 dark:text-slate-300 font-bold text-xs px-2.5 py-1 rounded-lg w-full">
                    {formatNumber(topThree[1].user.reputationPoints)} pts
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold Crown) */}
              {topThree[0] && (
                <div className="bg-card p-3.5 rounded-2xl border-2 border-amber-500/40 shadow-sm text-center flex flex-col items-center justify-between space-y-2 relative overflow-hidden bg-gradient-to-b from-amber-500/5 to-transparent">
                  <div className="absolute top-2 right-2 text-xs font-extrabold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>#1</span>
                  </div>
                  <div className="relative mt-2">
                    <Avatar className="h-14 w-14 border-2 border-amber-500 shadow-md">
                      <AvatarImage src={topThree[0].user.avatarUrl} alt={topThree[0].user.name} />
                      <AvatarFallback className="font-bold text-sm bg-amber-100 text-amber-700">
                        {topThree[0].user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-xs sm:text-sm text-foreground truncate max-w-[95px] sm:max-w-full">
                      {topThree[0].user.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block truncate">
                      {topThree[0].user.verifiedAnswersCount} verified guides
                    </span>
                  </div>
                  <div className="bg-amber-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg w-full shadow-2xs">
                    {formatNumber(topThree[0].user.reputationPoints)} pts
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {topThree[2] && (
                <div className="bg-card p-3 rounded-2xl border border-border/80 shadow-xs text-center flex flex-col items-center justify-between space-y-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-xs font-bold text-amber-700 bg-amber-700/10 px-2 py-0.5 rounded-full border border-amber-700/20">
                    🥉 #3
                  </div>
                  <Avatar className="h-12 w-12 border-2 border-amber-700/40 shadow-xs mt-2">
                    <AvatarImage src={topThree[2].user.avatarUrl} alt={topThree[2].user.name} />
                    <AvatarFallback className="font-bold text-xs bg-amber-100 text-amber-800">
                      {topThree[2].user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-foreground truncate max-w-[90px] sm:max-w-full">
                      {topThree[2].user.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {topThree[2].user.verifiedAnswersCount} verified guides
                    </span>
                  </div>
                  <div className="bg-amber-700/10 text-amber-800 dark:text-amber-300 font-bold text-xs px-2.5 py-1 rounded-lg w-full">
                    {formatNumber(topThree[2].user.reputationPoints)} pts
                  </div>
                </div>
              )}
            </div>

            {/* Full Rankings List */}
            <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground px-1 flex items-center justify-between">
                <span>Commuter Rankings</span>
                <span className="text-[10px] font-semibold text-muted-foreground/80">Total Points</span>
              </h3>

              <ol className="divide-y divide-border/60">
                {MOCK_TOP_CONTRIBUTORS.map((tc) => {
                  const initials = tc.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2);

                  return (
                    <li
                      key={tc.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs first:pt-1 last:pb-1"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-bold text-xs text-muted-foreground w-6 text-center">
                          #{tc.rank}
                        </span>
                        <Avatar className="h-9 w-9 border border-border shrink-0">
                          <AvatarImage src={tc.user.avatarUrl} alt={tc.user.name} />
                          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-foreground truncate hover:underline cursor-pointer">
                            {tc.user.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            {tc.user.verifiedAnswersCount} verified guides
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-foreground text-sm">
                          {formatNumber(tc.user.reputationPoints)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block -mt-0.5">pts</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </main>

          <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-22">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
