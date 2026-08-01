"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MapPin, Users, Search, ShieldCheck } from "lucide-react";

export function LandingHero() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-800/20 bg-blue-900/10 text-blue-900 dark:text-blue-300 text-xs font-semibold tracking-wide">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="uppercase text-[11px] font-bold tracking-wider">ONGOING DEVELOPMENT </span>
        </div>
      </div>

      {/* Main Catchy English Headline */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
          Never get lost in the commute. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-700 to-emerald-600 dark:from-blue-400 dark:via-blue-300 dark:to-emerald-400">
            Powered by real commuters.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl font-normal">
          The community Q&A platform where Filipino commuters ask questions, share step-by-step directions, and build a permanent, searchable transit database for everyone.
        </p>
      </div>

      {/* Key Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card/60 border border-border/80 backdrop-blur-sm">
          <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-foreground">Informal Routes</h4>
            <p className="text-[11px] text-muted-foreground">Jeepneys, UVs, TODAs & local landmarks</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card/60 border border-border/80 backdrop-blur-sm">
          <Search className="w-4 h-4 text-blue-800 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-foreground">Always Searchable</h4>
            <p className="text-[11px] text-muted-foreground">No lost Facebook comments</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card/60 border border-border/80 backdrop-blur-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-foreground">Human Verified</h4>
            <p className="text-[11px] text-muted-foreground">Upvoted by daily commuters</p>
          </div>
        </div>
      </div>
    </div>
  );
}
