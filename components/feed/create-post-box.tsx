"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Bus, Send } from "lucide-react";
import { PostFormModal } from "@/components/post/post-form-modal";

export function CreatePostBox() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const currentUser = session?.user;
  const userName = currentUser?.name || (currentUser as any)?.username || "Lance Christian Pallesco";
  const userImage = currentUser?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  return (
    <>
      {/* Feed Quick Ask Prompt Box */}
      <div className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border shrink-0">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">
              {userName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 relative" onClick={() => setIsOpen(true)}>
            <input
              type="text"
              readOnly
              placeholder="Ask a commute route question... (e.g. How to get to BGC?)"
              className="w-full bg-muted/40 hover:bg-muted/70 cursor-pointer text-xs sm:text-sm px-4 py-2.5 rounded-full border border-border/60 transition-colors placeholder:text-muted-foreground/80 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 text-xs font-semibold rounded-lg cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Add Route</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 text-xs font-semibold rounded-lg cursor-pointer"
            >
              <Bus className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">Transport Mode</span>
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-8 px-4 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-full gap-1.5 text-xs shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post</span>
          </Button>
        </div>
      </div>

      <PostFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="create"
      />
    </>
  );
}
