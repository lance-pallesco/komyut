"use client";

import Link from "next/link";
import Image from "next/image";
import { LandingBackground } from "@/components/landing/landing-background";
import { LandingAuthPanel } from "@/components/landing/landing-auth-panel";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <LandingBackground />

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
              href="/"
              className="px-3.5 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground inline-flex items-center gap-1.5 transition-all border border-border/80"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-12 flex items-center justify-center relative z-10">
        <LandingAuthPanel />
      </main>
    </div>
  );
}
