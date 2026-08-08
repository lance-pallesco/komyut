"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  MapPin,
  ShieldCheck,
  Edit,
  Share2,
  ArrowRight,
  Camera,
  Check,
  X,
  User as UserIcon,
  Sparkles,
  Copy,
  AtSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateProfileAction,
  checkUsernameAvailabilityAction,
} from "@/app/actions/user-actions";
import { uploadImageAction } from "@/app/actions/upload-action";

interface ProfileClientContainerProps {
  initialUser: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    bio: string | null;
    homeArea: string | null;
    reputationPoints: number;
    verifiedAnswersCount: number;
  };
}

export function ProfileClientContainer({ initialUser }: ProfileClientContainerProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"answers" | "questions" | "saved">("answers");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Hidden native file input references for device photo selection
  const coverFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean;
    reason?: string;
  }>({ checking: false, available: true });

  const sessionUser = session?.user;

  // Profile State (Committed state from database)
  const [profileData, setProfileData] = useState({
    id: initialUser.id,
    name: initialUser.name || "Commuter",
    username: initialUser.username || "commuter",
    avatarUrl:
      initialUser.avatarUrl ||
      sessionUser?.image ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    coverUrl: initialUser.coverUrl || "",
    homeArea: initialUser.homeArea || "Metro Manila Transit Network",
    bio: initialUser.bio || "Naglilingkod para maging accessible ang step-by-step commute directions para sa lahat.",
    badge: "Route Master",
    reputationPoints: initialUser.reputationPoints || 3420,
    verifiedGuidesCount: initialUser.verifiedAnswersCount || 88,
    contributionsCount: 142,
  });

  // Edit draft form copy (ONLY updated during editing, discarded if cancelled!)
  const [editForm, setEditForm] = useState({ ...profileData });

  // Upload Cover Photo (Updates draft editForm ONLY!)
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size is too large. Please select an image under 10MB.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadImageAction(formData, "cover");

      if (res.success && res.url) {
        setEditForm((prev) => ({ ...prev, coverUrl: res.url! }));
      } else {
        toast.error(res.error || "Failed to upload cover photo");
      }
    }
  };

  // Upload Avatar Photo (Updates draft editForm ONLY!)
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size is too large. Please select an image under 10MB.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadImageAction(formData, "avatar");

      if (res.success && res.url) {
        setEditForm((prev) => ({ ...prev, avatarUrl: res.url! }));
      } else {
        toast.error(res.error || "Failed to upload avatar photo");
      }
    }
  };

  // Real-time username uniqueness validation
  useEffect(() => {
    if (!isEditing) return;

    const timer = setTimeout(async () => {
      const cleanUsername = editForm.username.trim().toLowerCase().replace(/^@/, "");
      if (!cleanUsername) {
        setUsernameStatus({
          checking: false,
          available: false,
          reason: "Username cannot be empty",
        });
        return;
      }

      setUsernameStatus({ checking: true, available: true });
      const check = await checkUsernameAvailabilityAction(
        cleanUsername,
        profileData.username
      );
      setUsernameStatus({
        checking: false,
        available: check.available,
        reason: check.reason,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [editForm.username, isEditing, profileData.username]);

  const userHandle = `@${profileData.username}`;

  const handleShareProfile = () => {
    const uniqueShareUrl = `${window.location.origin}/user/${profileData.username}`;
    navigator.clipboard.writeText(uniqueShareUrl);
    toast.success("Profile link copied to clipboard!");
  };

  // SAVE CHANGES: Commits draft editForm into profileData and updates PostgreSQL DB
  const handleSaveProfile = async () => {
    if (!usernameStatus.available) {
      toast.error("Please choose a valid & unique username before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const cleanUsername = editForm.username.trim().toLowerCase().replace(/^@/, "");

      // 1. Commit draft state to committed profileData
      const updated = {
        ...editForm,
        username: cleanUsername,
      };
      setProfileData(updated);
      setEditForm(updated);
      setIsEditing(false);

      // 2. Dispatch event to update LeftSidebar
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("komyut-profile-update", {
            detail: {
              name: updated.name,
              username: updated.username,
              avatarUrl: updated.avatarUrl,
              coverUrl: updated.coverUrl,
            },
          })
        );
      }

      // 3. Persist to PostgreSQL database cleanly
      const res = await updateProfileAction({
        userId: profileData.id || (sessionUser as any)?.id,
        name: editForm.name,
        username: cleanUsername,
        avatarUrl: editForm.avatarUrl,
        coverUrl: editForm.coverUrl,
        bio: editForm.bio,
        homeArea: editForm.homeArea,
      });

      if (res.success) {
        toast.success("Profile saved successfully!");
      } else {
        toast.error("Database sync failed: " + res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // CANCEL EDIT: Reverts draft editForm back to committed profileData cleanly
  const handleCancelEdit = () => {
    setEditForm({ ...profileData });
    setIsEditing(false);
    setUsernameStatus({ checking: false, available: true });
  };

  const currentCoverUrl = isEditing ? editForm.coverUrl : profileData.coverUrl;
  const currentAvatarUrl = isEditing ? editForm.avatarUrl : profileData.avatarUrl;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Hidden Native File Inputs for Device Photo Pickers */}
      <input
        ref={coverFileRef}
        type="file"
        accept="image/*"
        onChange={handleCoverFileChange}
        className="hidden"
      />
      <input
        ref={avatarFileRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar Navigation */}
        <div className="hidden md:block md:col-span-3">
          <LeftSidebar profileData={profileData} />
        </div>

        {/* Center Content: Inline Editable Profile & Tabs */}
        <div className="md:col-span-6 space-y-6">
          {/* Profile Card Header */}
          <Card className="rounded-3xl border-border/80 bg-card overflow-hidden shadow-xs transition-all">
            {/* Banner Cover Photo: Displays draft in edit mode, committed profile in view mode */}
            <div className="h-36 sm:h-44 w-full relative overflow-hidden group">
              {currentCoverUrl ? (
                <img
                  src={currentCoverUrl}
                  alt="Cover banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-blue-950 via-blue-900 to-emerald-800 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>
              )}

              {/* Choose Cover Photo Button when editing */}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => coverFileRef.current?.click()}
                  className="absolute top-3 right-3 bg-black/75 hover:bg-black/95 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-md border border-white/20 cursor-pointer transition-all hover:scale-105"
                  title="Choose cover photo from device"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Choose Cover Photo</span>
                </button>
              )}
            </div>

            {/* Profile Info Row */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
                {/* Avatar with Ring & Edit Overlay */}
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-card bg-muted overflow-hidden shadow-lg flex items-center justify-center text-3xl font-bold text-emerald-600 relative">
                    <img
                      src={currentAvatarUrl}
                      alt={isEditing ? editForm.name : profileData.name}
                      className="w-full h-full object-cover"
                    />
                    {isEditing && (
                      <div
                        onClick={() => avatarFileRef.current?.click()}
                        className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                        title="Choose avatar photo from device"
                      >
                        <Camera className="w-6 h-6 mb-0.5" />
                        <span className="text-[10px] font-bold">Edit Avatar</span>
                      </div>
                    )}
                  </div>
                  {!isEditing && (
                    <span
                      className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-card"
                      title="Active Commuter"
                    />
                  )}
                </div>

                {/* Profile Header Action Buttons */}
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShareProfile}
                        className="rounded-full gap-1.5 text-xs font-semibold cursor-pointer hover:bg-muted"
                      >
                        <Share2 className="w-3.5 h-3.5 text-primary" />
                        <span>Share Profile</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditForm({ ...profileData });
                          setIsEditing(true);
                        }}
                        className="rounded-full gap-1.5 text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="rounded-full gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isSaving || !usernameStatus.available}
                        className="rounded-full gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Editable Details Form in place */}
              {!isEditing ? (
                /* View Mode */
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                      {profileData.name}
                    </h1>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold gap-1 px-2.5 py-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {profileData.badge}
                    </Badge>
                  </div>

                  <p className="text-xs font-semibold text-muted-foreground">
                    {userHandle}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{profileData.homeArea}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1 italic">
                    "{profileData.bio}"
                  </p>
                </div>
              ) : (
                /* Inline Edit Mode (Mutates editForm draft ONLY) */
                <div className="space-y-3.5 pt-1 animate-in fade-in-50 duration-200">
                  {/* Full Name Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-primary" />
                      <span>Full Name:</span>
                    </label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => {
                        const cleanName = e.target.value.replace(/[0-9]/g, "");
                        setEditForm((prev) => ({ ...prev, name: cleanName }));
                      }}
                      placeholder="Your name..."
                      className="h-9 text-xs sm:text-sm font-bold bg-background rounded-xl"
                    />
                  </div>

                  {/* Username Input with Real-time Uniqueness Validation */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <AtSign className="w-3 h-3 text-blue-500" />
                      <span>Username (Unique Commuter Handle):</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-muted-foreground select-none">
                        @
                      </span>
                      <Input
                        value={editForm.username}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/\s+/g, "_");
                          setEditForm((prev) => ({ ...prev, username: val }));
                        }}
                        placeholder="username"
                        className="pl-7 h-9 text-xs font-semibold bg-background rounded-xl"
                      />
                    </div>

                    {/* Uniqueness Validation Display Feedback */}
                    {editForm.username.trim().toLowerCase().replace(/^@/, "") !==
                      profileData.username.trim().toLowerCase().replace(/^@/, "") && (
                      usernameStatus.checking ? (
                        <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 pt-0.5">
                          <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
                          <span>Checking username availability...</span>
                        </p>
                      ) : !usernameStatus.available ? (
                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{usernameStatus.reason}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Username @{editForm.username.replace(/^@/, "")} is available!</span>
                        </p>
                      )
                    )}
                  </div>

                  {/* Home Area Transit Network Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      <span>Home Area:</span>
                    </label>
                    <Input
                      value={editForm.homeArea || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditForm((prev) => ({ ...prev, homeArea: val }));
                      }}
                      placeholder="e.g. Metro Manila & Cavite Transit Network"
                      className="h-9 text-xs bg-background rounded-xl"
                    />
                  </div>

                  {/* Bio Tagline Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Bio Tagline:</span>
                    </label>
                    <textarea
                      value={editForm.bio || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditForm((prev) => ({ ...prev, bio: val }));
                      }}
                      placeholder="Tell kapwa commuters about yourself..."
                      rows={2}
                      className="w-full text-xs bg-background border border-border/80 rounded-xl p-2.5 outline-none focus:border-primary transition-all resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Profile Impact Stats Bar */}
              <div className="grid grid-cols-3 gap-3 pt-5 mt-5 border-t border-border/60 text-center">
                <div className="p-3 rounded-2xl bg-muted/30">
                  <span className="text-base sm:text-lg font-black text-foreground block">
                    {profileData.reputationPoints.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">Reputation Pts</span>
                </div>
                <div className="p-3 rounded-2xl bg-muted/30">
                  <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block">
                    {profileData.verifiedGuidesCount}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">Verified Guides</span>
                </div>
                <div className="p-3 rounded-2xl bg-muted/30">
                  <span className="text-base sm:text-lg font-black text-foreground block">
                    {profileData.contributionsCount}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">Contributions</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/80 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("answers")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "answers"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                Verified Guides ({profileData.verifiedGuidesCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("questions")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "questions"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                My Questions (12)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "saved"
                    ? "bg-blue-900 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                Saved Routes (5)
              </button>
            </div>

            {/* Tab Activity Content Card */}
            <Card className="p-5 rounded-3xl border-border/80 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
                    Verified Answer
                  </Badge>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 16 Upvotes
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-900/5 dark:bg-blue-950/30 border border-blue-800/15 flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>SM North EDSA</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span>BGC High Street</span>
              </div>

              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                Mula SM North, sakay ka ng MRT-3 North Ave station tapos baba ka sa Ayala station. Mula Ayala station footbridge, tumawid ka papuntang BGC Bus Terminal. Sakay ng West Route BGC Bus, baba ka sa Bonifacio High Street.
              </p>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block md:col-span-3">
          <RightSidebar />
        </div>
      </main>
    </div>
  );
}
