"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Search, PlusCircle, Menu, LogOut, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LeftSidebar } from "./left-sidebar";
import { NotificationPopover } from "./notification-popover";

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Navbar({ searchQuery = "", onSearchChange }: NavbarProps) {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Mobile Menu */}
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 text-muted-foreground"
                  aria-label="Open mobile navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-4 border-b border-border text-left">
                <SheetTitle className="flex items-center gap-2 font-black">
                  <Image
                    src="/logo.png"
                    alt="KOMYUT Logo"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                  />
                  KOMYUT
                </SheetTitle>
              </SheetHeader>
              <div className="p-2">
                <LeftSidebar />
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 group transition-opacity hover:opacity-90"
          >
            <Image
              src="/logo.png"
              alt="KOMYUT Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-foreground leading-none">
                KOMYUT
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground hidden sm:block tracking-wide uppercase">
                Commuter Q&A PH
              </span>
            </div>
          </Link>
        </div>

        {/* Global Live Search Bar */}
        <form onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) {
            window.location.href = `/feed?q=${encodeURIComponent(searchQuery.trim())}`;
          } else {
            window.location.href = "/feed";
          }
        }} className="flex-1 max-w-xl mx-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Maghanap ng biyahe, landmark, o jeep route... (e.g. BGC, Cubao)"
              className="pl-9 pr-4 h-10 text-xs sm:text-sm bg-muted/40 focus-visible:bg-background border-border/80 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </form>

        {/* Header Right Action Area */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          <NotificationPopover />

          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-2 border-l border-border pl-2 ml-1">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 overflow-hidden border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-600">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(session.user.name || "C")[0]}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-foreground max-w-[100px] truncate">
                  {session.user.name || (session.user as any).username}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-full text-xs font-bold gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
