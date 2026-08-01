"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Bus, Send } from "lucide-react";

export function CreatePostBox() {
  return (
    <div className="bg-card p-4 rounded-xl border border-border/70 shadow-xs space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border border-border shrink-0">
          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" alt="Juan Dela Cruz" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            JD
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <input
            type="text"
            readOnly
            placeholder="Magtanong ng commute route... (e.g. Paano pumunta sa BGC?)"
            className="w-full bg-muted/40 hover:bg-muted/70 cursor-pointer text-xs sm:text-sm px-4 py-2.5 rounded-full border border-border/60 transition-colors placeholder:text-muted-foreground/80 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs font-medium rounded-lg"
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Add Route</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 text-xs font-medium rounded-lg"
          >
            <Bus className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Transport Mode</span>
          </Button>
        </div>

        <Button
          size="sm"
          className="h-8 px-4 bg-primary text-primary-foreground font-semibold rounded-full gap-1.5 text-xs shadow-xs hover:bg-primary/90"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Post</span>
        </Button>
      </div>
    </div>
  );
}
