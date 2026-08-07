"use client";

import { MapPin, MessageSquareCheck, ShieldCheck, Compass, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function LandingFeaturesBar() {
  return (
    <section className="py-12 border-t border-border/60 bg-muted/20 relative z-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Why KOMYUT Exists
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Built for the reality of Filipino commuting.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3 hover:border-blue-900/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-900/10 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-foreground">Informal Transit Focus</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Google Maps misses jeepneys, tricycle TODAs, and UV Express terminals. KOMYUT maps the exact landmark-based routes Filipinos actually use.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3 hover:border-blue-900/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-900/10 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold">
              <MessageSquareCheck className="w-5 h-5 text-blue-800 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-foreground">Permanent Knowledge Base</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Facebook group comments get buried in hours. On KOMYUT, every commute answer is structured, searchable, and saved permanently.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3 hover:border-blue-900/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-900/10 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-foreground">Human Source of Truth</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              No AI hallucinations. Every direction is upvoted and verified by commuters who travel the route daily.
            </p>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold">Ready to check your commute route?</h4>
            <p className="text-xs text-blue-200">Join thousands of Filipino commuters sharing transit directions.</p>
          </div>
          <Link
            href="/feed"
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <span>Jump straight to feed</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
