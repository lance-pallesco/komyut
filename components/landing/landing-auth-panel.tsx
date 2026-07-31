"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export function LandingAuthPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    toast.success("Connecting with Google OAuth...");
    setTimeout(() => {
      setIsGoogleLoading(false);
      router.push("/feed");
    }, 1000);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    toast.success(mode === "login" ? "Logging into your account..." : "Account created successfully!");
    setTimeout(() => {
      setIsLoading(false);
      router.push("/feed");
    }, 1000);
  };

  const handleGuestExplore = () => {
    toast.info("Entering KOMYUT feed as guest...");
    router.push("/feed");
  };

  return (
    <Card className="w-full max-w-md mx-auto border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden relative z-10">
      <CardHeader className="text-left pb-2">
        <div className="flex items-center gap-3.5 pt-3">
          <Image
            src="/logo.png"
            alt="KOMYUT Logo"
            width={56}
            height={56}
            className="h-12 w-12 sm:h-14 sm:w-14 object-contain shrink-0"
          />
          <div className="space-y-0.5">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-[#3D3C3A] dark:text-[#E2E2E2] tracking-tight leading-tight">
              {mode === "login" ? "Welcome back!" : "Join Community"}
            </CardTitle>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 ml-1 uppercase tracking-wider block">
              KOMYUT PH
            </span>
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Access verified commute routes, save your daily transit, and help fellow Filipino commuters.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Email / Username & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div className="space-y-1">
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or Email"
                className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-muted/30 focus-visible:bg-background border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-muted/30 focus-visible:bg-background border-border"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
          >
            {isLoading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span>{mode === "login" ? "Sign In" : "Create Free Account"}</span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80" />
          </div>
          <span className="relative bg-card px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full h-11 rounded-2xl border-border hover:bg-muted/60 font-semibold text-sm gap-3 transition-all cursor-pointer shadow-xs"
        >
          {isGoogleLoading ? (
            <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </Button>

        {/* Toggle Mode & Guest Button */}
        <div className="pt-2 space-y-2 border-t border-border/50 text-center">
          <div className="text-xs text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
