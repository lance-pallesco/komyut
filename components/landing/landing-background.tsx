"use client";

import { MapPin, ArrowRight, MessageCircle, Heart, Bookmark, Compass } from "lucide-react";

export function LandingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Deep Blue & Emerald Green Ambient Glow Gradients */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-900/25 dark:bg-blue-950/40 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-emerald-700/20 dark:bg-emerald-950/30 rounded-full blur-[140px]" />
      <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] bg-blue-800/20 dark:bg-blue-900/30 rounded-full blur-[160px]" />

      {/* Blurred Feed & Route Network Mockup */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20 blur-md sm:blur-[6px] scale-[1.03] transition-all">
        <div className="max-w-6xl mx-auto px-4 pt-12 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar Mock */}
          <div className="hidden md:block md:col-span-3 space-y-4">
            <div className="p-4 rounded-2xl bg-card/80 border border-border space-y-3">
              <div className="h-6 w-32 bg-muted rounded-md" />
              <div className="h-4 w-24 bg-muted/60 rounded-md" />
              <div className="h-4 w-28 bg-muted/60 rounded-md" />
              <div className="h-4 w-20 bg-muted/60 rounded-md" />
            </div>
            <div className="p-4 rounded-2xl bg-card/80 border border-border space-y-2">
              <div className="h-5 w-24 bg-muted rounded-md" />
              <div className="h-3 w-36 bg-muted/50 rounded-md" />
            </div>
          </div>

          {/* Center Feed Cards Mock */}
          <div className="md:col-span-6 space-y-4">
            {/* Card 1 */}
            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-xs">
                  KT
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-28 bg-muted rounded-md" />
                  <div className="h-3 w-16 bg-muted/50 rounded-md" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-5 w-3/4 bg-foreground/20 rounded-md" />
                <div className="h-4 w-full bg-muted-foreground/15 rounded-md" />
                <div className="h-4 w-2/3 bg-muted-foreground/15 rounded-md" />
              </div>
              <div className="p-3 rounded-xl bg-blue-900/10 dark:bg-blue-950/30 border border-blue-800/20 flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>SM North EDSA</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span>BGC High Street</span>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> 24</div>
                <div className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 5 answers</div>
                <div className="ml-auto"><Bookmark className="w-3.5 h-3.5" /></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-800 dark:text-blue-300 font-bold text-xs">
                  CM
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-muted rounded-md" />
                  <div className="h-3 w-20 bg-muted/50 rounded-md" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-5 w-4/5 bg-foreground/20 rounded-md" />
                <div className="h-4 w-full bg-muted-foreground/15 rounded-md" />
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Katipunan LRT-2</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span>UP Diliman Melchor Hall</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar Mock */}
          <div className="hidden md:block md:col-span-3 space-y-4">
            <div className="p-4 rounded-2xl bg-card/80 border border-border space-y-3">
              <div className="h-5 w-28 bg-muted rounded-md" />
              <div className="h-4 w-full bg-muted/50 rounded-md" />
              <div className="h-4 w-3/4 bg-muted/50 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Soft Bottom Gradient Fade */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
}
