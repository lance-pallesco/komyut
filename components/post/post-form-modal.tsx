"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { MapPin, Bus, Send, Globe, Image as ImageIcon, Smile, Tag, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TransportMode } from "@/types";
import { createPostAction, updatePostAction } from "@/app/actions/post-actions";

export const TRANSPORT_TAGS: TransportMode[] = [
  "Jeepney",
  "Bus",
  "UV Express",
  "MRT",
  "LRT",
  "Tricycle",
  "Walk",
];

export interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialValues?: {
    postId?: string;
    title?: string;
    body?: string;
    origin?: string;
    destination?: string;
    isAnonymous?: boolean;
    selectedTags?: string[];
  };
  onSuccess?: (updatedData?: any) => void;
}

export function PostFormModal({
  isOpen,
  onClose,
  mode = "create",
  initialValues,
  onSuccess,
}: PostFormModalProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState(initialValues?.title || "");
  const [origin, setOrigin] = useState(initialValues?.origin || "");
  const [destination, setDestination] = useState(initialValues?.destination || "");
  const [body, setBody] = useState(initialValues?.body || "");
  const [isAnonymous, setIsAnonymous] = useState(initialValues?.isAnonymous || false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialValues?.selectedTags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialValues?.title || "");
      setOrigin(initialValues?.origin || "");
      setDestination(initialValues?.destination || "");
      setBody(initialValues?.body || "");
      setIsAnonymous(initialValues?.isAnonymous || false);
      setSelectedTags(initialValues?.selectedTags || []);
    }
  }, [isOpen, initialValues]);

  const currentUser = session?.user;
  const userName = isAnonymous
    ? "Anonymous Commuter"
    : currentUser?.name || (currentUser as any)?.username || "Lance Christian Pallesco";
  const userImage = isAnonymous
    ? undefined
    : currentUser?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !origin.trim() || !destination.trim() || !body.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const result = await createPostAction({
          title: title.trim(),
          origin: origin.trim(),
          destination: destination.trim(),
          body: body.trim(),
          isAnonymous,
          selectedTagNames: selectedTags,
        });

        if (result.success) {
          toast.success("Commute question posted!");
          onClose();
          setTitle("");
          setOrigin("");
          setDestination("");
          setBody("");
          setIsAnonymous(false);
          setSelectedTags([]);
          onSuccess?.(result.post);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to post question.");
        }
      } else {
        if (!initialValues?.postId) {
          toast.error("Post ID missing for update.");
          return;
        }

        const result = await updatePostAction({
          postId: initialValues.postId,
          title: title.trim(),
          origin: origin.trim(),
          destination: destination.trim(),
          body: body.trim(),
          selectedTagNames: selectedTags,
        });

        if (result.success) {
          toast.success("Post updated successfully!");
          onClose();
          onSuccess?.({
            title: title.trim(),
            origin: origin.trim(),
            destination: destination.trim(),
            body: body.trim(),
            transportModes: selectedTags,
          });
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update post.");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    origin.trim().length > 0 &&
    destination.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <DialogTitle className="text-center font-extrabold text-base sm:text-lg">
          {mode === "create" ? "Create post" : "Edit post"}
        </DialogTitle>
        <DialogClose onClick={onClose} />
      </DialogHeader>

      <DialogContent className="space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Post Anonymously Toggle Banner */}
          {mode === "create" && (
            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Post anonymously</span>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>
          )}

          {/* Author Profile Bar */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border shrink-0">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                {userName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-none">{userName}</h4>
              {/* <div className="flex items-center gap-1.5 pt-0.5">
                <Badge variant="outline" className="text-[10px] font-semibold gap-1 py-0 px-2 bg-muted/60 text-muted-foreground border-border">
                  <Globe className="w-3 h-3 text-emerald-500" />
                  <span>Public group</span>
                </Badge>
              </div> */}
            </div>
          </div>

          {/* 1. Question Title (Required *) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Question Title <span className="text-emerald-500">*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. May UV Express ba mula SM North papuntang BGC?"
              className="h-10 rounded-xl text-xs sm:text-sm bg-muted/30 focus-visible:bg-background border-border"
              required
            />
          </div>

          {/* 2. Body Textarea (Required *) */}
          <div className="space-y-1">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Describe your commute question in detail... (e.g. transport options, landmark details)"
              className="w-full p-3 rounded-2xl bg-muted/30 focus-visible:bg-background border border-border text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary outline-none transition-all resize-none"
              required
            />
          </div>

          {/* 3. Route Inputs (From & To Required *) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                From (Origin) <span className="text-emerald-500">*</span>
              </label>
              <Input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. SM North EDSA Terminal"
                className="h-10 rounded-xl text-xs sm:text-sm bg-muted/30 focus-visible:bg-background border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                To (Destination) <span className="text-emerald-500">*</span>
              </label>
              <Input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. BGC High Street (7th Ave)"
                className="h-10 rounded-xl text-xs sm:text-sm bg-muted/30 focus-visible:bg-background border-border"
                required
              />
            </div>
          </div>

          {/* 4. Transport Mode Tag Selector */}
          <div className="space-y-1.5 pt-0.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Select Transport Modes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TRANSPORT_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Bottom Toolbar: Add to your post */}
          <div className="p-3 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Add to your post</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toast.info("Image attachment feature ready.")}
                className="p-1.5 rounded-lg hover:bg-muted text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                title="Photo/video"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => toast.info("Tag location pin selected.")}
                className="p-1.5 rounded-lg hover:bg-muted text-red-500 transition-colors cursor-pointer"
                title="Location"
              >
                <MapPin className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => toast.info("Transport mode selector active.")}
                className="p-1.5 rounded-lg hover:bg-muted text-blue-500 transition-colors cursor-pointer"
                title="Transport Tag"
              >
                <Tag className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => toast.info("Emoji selector active.")}
                className="p-1.5 rounded-lg hover:bg-muted text-amber-500 transition-colors cursor-pointer"
                title="Feeling/activity"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Submit Post / Save Changes Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full h-11 rounded-2xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === "create" ? "Posting to Feed..." : "Saving Changes..."}</span>
              </div>
            ) : (
              <span>{mode === "create" ? "Post" : "Save Changes"}</span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
