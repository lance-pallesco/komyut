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
  title = "Kailangan Mag-Sign In Para Magpatuloy",
  description = "Mag-sign in muna sa KOMYUT para makapag-like, makapag-post ng tanong, at ma-access ang iyong personal profile.",
  icon = "lock",
}: GuestAuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignInClick = () => {
    onClose();
    router.push("/");
  };

  const renderIcon = () => {
    switch (icon) {
      case "heart":
        return <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20 animate-pulse" />;
      case "plus":
        return <PlusCircle className="w-8 h-8 text-emerald-500 animate-bounce" />;
      case "user":
        return <User className="w-8 h-8 text-blue-500" />;
      case "bookmark":
        return <Bookmark className="w-8 h-8 text-amber-500" />;
      default:
        return <ShieldAlert className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} className="max-w-md">
      <div className="p-6 text-center space-y-4">
        {/* Icon & Brand Header */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center shadow-inner">
            {renderIcon()}
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <Image src="/logo.png" alt="KOMYUT Logo" width={20} height={20} className="h-5 w-5 object-contain" />
            <span className="text-xs font-black tracking-wider text-muted-foreground uppercase">KOMYUT PH</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">{description}</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <Button
            type="button"
            onClick={handleSignInClick}
            className="w-full h-11 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm gap-2 cursor-pointer shadow-md transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Pumunta sa Sign In / Register</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
          >
            Ipagpatuloy ang pag-browse lang
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
