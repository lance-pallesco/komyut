"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Lock, Mail, User, AtSign } from "lucide-react";
import { toast } from "sonner";
import { registerUserAction } from "@/app/actions/auth-actions";

export function LandingAuthPanel() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      toast.info("Connecting to Google OAuth...");
      await signIn("google", { callbackUrl: "/feed" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign in with Google.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsFacebookLoading(true);
      toast.info("Connecting to Facebook OAuth...");
      await signIn("facebook", { callbackUrl: "/feed" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign in with Facebook.");
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim() || !username.trim()) {
          toast.error("Please provide your full name and username.");
          setIsLoading(false);
          return;
        }

        const res = await registerUserAction({
          name,
          username,
          email,
          password,
        });

        if (!res.success) {
          toast.error(res.error || "Registration failed.");
          setIsLoading(false);
          return;
        }

        toast.success("Account created successfully! Logging you in...");

        const signInRes = await signIn("credentials", {
          emailOrUsername: email,
          password,
          redirect: false,
        });

        if (signInRes?.error) {
          toast.error("Account created, but automatic login failed. Please sign in.");
          setMode("login");
        } else {
          router.push("/feed");
        }
      } else {
        const res = await signIn("credentials", {
          emailOrUsername: email,
          password,
          redirect: false,
        });

        if (res?.error) {
          toast.error(res.error || "Invalid username/email or password.");
        } else {
          toast.success("Welcome back! Redirecting to feed...");
          router.push("/feed");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <form onSubmit={handleFormSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name (e.g. Juan Dela Cruz)"
                    className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-muted/30 focus-visible:bg-background border-border"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username (e.g. juandelacruz)"
                    className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-muted/30 focus-visible:bg-background border-border"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address / Identifier */}
          <div className="space-y-1">
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={mode === "register" ? "email" : "text"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "login" ? "Username or Email" : "Email Address"}
                className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-muted/30 focus-visible:bg-background border-border"
                required
              />
            </div>
          </div>

          {/* Password */}
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

        <div className="relative flex items-center justify-center my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80" />
          </div>
          <span className="relative bg-card px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            or continue with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="h-10 rounded-xl border-border hover:bg-muted/60 font-semibold text-xs gap-2 transition-all cursor-pointer shadow-xs"
          >
            {isGoogleLoading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleFacebookLogin}
            disabled={isFacebookLoading}
            className="h-10 rounded-xl border-border hover:bg-muted/60 font-semibold text-xs gap-2 transition-all cursor-pointer shadow-xs"
          >
            {isFacebookLoading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <span>Facebook</span>
          </Button>
        </div>

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
