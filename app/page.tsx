"use client";

import Link from "next/link";
import Image from "next/image";
import { LandingBackground } from "@/components/landing/landing-background";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingAuthPanel } from "@/components/landing/landing-auth-panel";
import { LandingFeaturesBar } from "@/components/landing/landing-features-bar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      {/* Background Blurred Feed UI & Ambient Light Effects */}
      <LandingBackground />

      {/* Sticky Header */}
      <header className="w-full border-b border-border/60 bg-background/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="KOMYUT Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-foreground leading-none">
                KOMYUT
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                Commuter Q&A PH
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/feed"
              className="px-4 py-2 rounded-full bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground inline-flex items-center gap-1.5 transition-all border border-border/80"
            >
              <span>Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Split Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Side: English Value Proposition & Taglines */}
        <div className="lg:col-span-7">
          <LandingHero />
        </div>

        {/* Right Side: Auth Card with Google OAuth & Email */}
        <div className="lg:col-span-5">
          <LandingAuthPanel />
        </div>
      </main>

      {/* Feature Highlights Section */}
      <LandingFeaturesBar />

      {/* Simple Footer */}
      <footer className="py-6 border-t border-border/60 text-center text-xs text-muted-foreground bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} KOMYUT PH. Community-driven commute directions for the Philippines.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/feed" className="hover:text-foreground transition-colors">
              Feed Forum
            </Link>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Human Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
