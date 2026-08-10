"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, ShieldAlert, Heart, PlusCircle, User, Bookmark } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: "heart" | "plus" | "user" | "bookmark" | "lock";
}

export function GuestAuthModal({
  isOpen,
  onClose,
  title = "Sign In Required to Continue",
  description = "Sign in to KOMYUT to like, post questions, and access your personal profile.",
}: GuestAuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignInClick = () => {
    onClose();
    router.push("/");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} className="max-w-md">
      <div className="p-6 text-center space-y-4">
        {/* System Logo & KOMYUT PH Header */}
        <div className="flex flex-col items-center justify-center space-y-2 pt-1">
          <Image
            src="/logo.png"
            alt="KOMYUT Logo"
            width={52}
            height={52}
            className="h-13 w-13 object-contain"
          />
          <span className="text-xs font-black tracking-wider text-muted-foreground uppercase">
            KOMYUT PH
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <Button
            type="button"
            onClick={handleSignInClick}
            className="w-full h-11 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm gap-2 cursor-pointer shadow-md transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Proceed to Sign In / Register</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
          >
            Continue browsing only
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
