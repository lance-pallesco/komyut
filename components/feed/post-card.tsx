"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import type { Post, Comment } from "@/types";
import { formatRelativeTime } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { UserInfo } from "@/components/shared/user-info";
import { UserHoverCard } from "@/components/shared/user-hover-card";
import { TransportBadge } from "@/components/shared/transport-badge";
import { useGuestAuthModal } from "@/components/providers/guest-auth-provider";
import { PostRouteDisplay } from "./post-route-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Share2,
  Bookmark,
  Pin,
  Heart,
  MoreHorizontal,
  Flag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  LogIn,
  Pencil,
  MessageSquareOff,
  X,
} from "lucide-react";
import { cn, getCurrentUrl, copyToClipboard } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createAnswerAction, deleteAnswerAction } from "@/app/actions/answer-actions";
import { deletePostAction, toggleCommentingAction } from "@/app/actions/post-actions";
import { toggleAnswerVoteAction } from "@/app/actions/vote-actions";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { LikeButton } from "@/components/shared/like-button";
import { AdaptiveCommentInput } from "@/components/post/adaptive-comment-input";
import { PostFormModal } from "@/components/post/post-form-modal";

interface PostCardProps {
  post: Post;
  isHighlighted?: boolean;
  onVote: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  postAuthorId?: string;
  postAuthorName?: string;
  isCommentingDisabled?: boolean;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  activeReplyThreadId: string | null;
  setActiveReplyThreadId: (id: string | null) => void;
  targetMentionAuthor: string | null;
  setTargetMentionAuthor: (authorName: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onReplySubmit: (parentId: string, authorName?: string) => void;
}

function formatCommentBody(comment: Comment) {
  const rawBody = comment.body || "";

  // Strip any literal @undefined or @null strings
  const cleanBody = rawBody
    .replace(/@undefined\s*/gi, "")
    .replace(/@null\s*/gi, "")
    .trim();

  if (
    comment.parentAuthorName &&
    comment.parentAuthorName !== "undefined" &&
    comment.parentAuthorName !== "null"
  ) {
    const parentName = comment.parentAuthorName;
    const escapedName = parentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^@${escapedName}\\s*`, "i");
    const hasPrefix = regex.test(cleanBody);
    const bodyWithoutPrefix = hasPrefix ? cleanBody.replace(regex, "") : cleanBody;

    return (
      <>
        <span className="font-bold text-primary hover:underline cursor-pointer mr-1">
          @{parentName}
        </span>
        {bodyWithoutPrefix}
      </>
    );
  }

  const mentionMatch = cleanBody.match(/^(@[^\n\r]+?)(?=\s|$)/);
  if (mentionMatch) {
    const mentionText = mentionMatch[1];
    if (mentionText !== "@undefined" && mentionText !== "@null") {
      const restText = cleanBody.slice(mentionText.length);
      return (
        <>
          <span className="font-bold text-primary hover:underline cursor-pointer mr-1">
            {mentionText}
          </span>
          {restText}
        </>
      );
    }
  }

  return cleanBody;
}

interface Level3ReplyItemProps {
  subReply: Comment;
  isPostOwner: boolean;
  isCommentingDisabled?: boolean;
  onLike: (replyId: string) => void;
  onDelete?: (replyId: string) => void;
  onInitiateReply: (targetAuthorName: string) => void;
}

function Level3ReplyItem({
  subReply,
  isPostOwner,
  isCommentingDisabled = false,
  onLike,
  onDelete,
  onInitiateReply,
}: Level3ReplyItemProps) {
  const { data: session, status } = useSession();
  const { openGuestAuthModal } = useGuestAuthModal();
  const loggedInUser = session?.user;

  const [liked, setLiked] = useState(subReply.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(subReply.upvoteCount);

  useEffect(() => {
    setLiked(subReply.isLiked ?? false);
    setLikesCount(subReply.upvoteCount);
  }, [subReply.isLiked, subReply.upvoteCount]);

  const canDelete =
    isPostOwner ||
    (loggedInUser?.id && subReply.author.id === loggedInUser.id) ||
    (loggedInUser?.name && subReply.author.name === loggedInUser.name);

  const toggleLike = async () => {
    if (status !== "authenticated") {
      openGuestAuthModal({
        title: "Mag-sign In Para Mag-like",
        description: "Kailangan ng account para makapag-like ng sagot.",
        icon: "heart",
      });
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    onLike(subReply.id);

    try {
      await toggleAnswerVoteAction(subReply.id);
    } catch (err) {
      console.error("Error liking Level 3 reply:", err);
    }
  };

  return (
    <div className="relative flex items-start gap-2.5 sm:gap-3 pl-3 sm:pl-4">
      {/* Level 3 Branch Elbow */}
      <div className="absolute left-0 top-3.5 w-3 sm:w-4 h-3 border-l-2 border-b-2 border-border/60 rounded-bl-lg -translate-x-1/2" />

      <UserHoverCard author={subReply.author}>
        <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border border-border/50 shrink-0 mt-0.5 z-10 ring-2 ring-background">
          <AvatarImage src={subReply.author.avatarUrl} alt={subReply.author.name} />
          <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
            {(subReply.author.name || "C").substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </UserHoverCard>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
            <UserHoverCard author={subReply.author}>
              <span className="text-xs sm:text-sm font-bold text-foreground hover:underline truncate">
                {subReply.author.name}
              </span>
            </UserHoverCard>
            <span className="text-[10px] text-muted-foreground/70 shrink-0" suppressHydrationWarning>
              • {formatRelativeTime(subReply.createdAt)}
            </span>
          </div>

          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(subReply.id)}
              className="flex items-center gap-1 text-muted-foreground/70 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium cursor-pointer group/cmt-delete shrink-0"
              title="Delete reply"
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground/70 group-hover/cmt-delete:text-rose-600" />
              {/* <span className="text-[11px]">Delete</span> */}
            </button>
          )}
        </div>

        {/* Level 3 Body Text */}
        <div className="py-0.5">
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal break-words whitespace-pre-line">
            {formatCommentBody(subReply)}
          </p>
        </div>

        {/* Level 3 Action Buttons */}
        <div className="flex items-center gap-3 pt-0.5 text-xs">
          <LikeButton
            count={likesCount}
            isLiked={liked}
            onLike={toggleLike}
            variant="comment"
            size="sm"
          />

          {!isCommentingDisabled && (
            <button
              type="button"
              onClick={() => onInitiateReply(subReply.author.name)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer group/cmt-reply"
              title="Reply to comment"
            >
              <MessageCircle className="w-3.5 h-3.5 transition-transform group-hover/cmt-reply:scale-110" />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SubReplyItemProps {
  reply: Comment;
  postAuthorId?: string;
  postAuthorName?: string;
  isCommentingDisabled?: boolean;
  onLike: (replyId: string) => void;
  onDelete?: (replyId: string) => void;
  onInitiateReply: (targetAuthorName: string) => void;
  activeReplyThreadId: string | null;
  targetMentionAuthor: string | null;
  setTargetMentionAuthor: (authorName: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onReplySubmit: (parentId: string, authorName?: string) => void;
}

function SubReplyItem({
  reply,
  postAuthorId,
  postAuthorName,
  isCommentingDisabled = false,
  onLike,
  onDelete,
  onInitiateReply,
  activeReplyThreadId,
  targetMentionAuthor,
  setTargetMentionAuthor,
  replyText,
  setReplyText,
  onReplySubmit,
}: SubReplyItemProps) {
  const { data: session, status } = useSession();
  const { openGuestAuthModal } = useGuestAuthModal();
  const loggedInUser = session?.user;
  const userImage = loggedInUser?.image || "/logo.png";
  const userName = loggedInUser?.name || (loggedInUser as any)?.username || "Commuter";
  const userInitials = (userName[0] || "C").toUpperCase();

  const [liked, setLiked] = useState(reply.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(reply.upvoteCount);
  const subInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLiked(reply.isLiked ?? false);
    setLikesCount(reply.upvoteCount);
  }, [reply.isLiked, reply.upvoteCount]);

  const isReplyOwner =
    (loggedInUser?.id && reply.author.id === loggedInUser.id) ||
    (loggedInUser?.name && reply.author.name === loggedInUser.name);

  const isPostOwner =
    (loggedInUser?.id && postAuthorId && postAuthorId === loggedInUser.id) ||
    (loggedInUser?.name && postAuthorName && postAuthorName === loggedInUser.name);

  const canDelete = isReplyOwner || isPostOwner;

  const toggleLike = async () => {
    if (status !== "authenticated") {
      openGuestAuthModal({
        title: "Mag-sign In Para Mag-like",
        description: "Kailangan ng account para makapag-like ng sagot.",
        icon: "heart",
      });
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    onLike(reply.id);

    try {
      await toggleAnswerVoteAction(reply.id);
    } catch (err) {
      console.error("Error liking reply:", err);
    }
  };

  const isSubThreadActive = activeReplyThreadId === reply.id;

  const handleSubFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplySubmit(reply.id, targetMentionAuthor || undefined);
  };

  return (
    <div className="space-y-2 relative">
      {/* Level 2 Reply Item */}
      <div className="relative flex items-start gap-2.5 sm:gap-3 pl-3 sm:pl-4">
        {/* Curved Branch Line (L-shaped elbow) */}
        <div className="absolute left-0 top-3.5 w-3 sm:w-4 h-3 border-l-2 border-b-2 border-border/70 rounded-bl-lg -translate-x-1/2" />

        <UserHoverCard author={reply.author}>
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-border/50 shrink-0 mt-0.5 z-10 ring-2 ring-background">
            <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
              {(reply.author.name || "C").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </UserHoverCard>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
              <UserHoverCard author={reply.author}>
                <span className="text-xs sm:text-sm font-bold text-foreground hover:underline truncate">
                  {reply.author.name}
                </span>
              </UserHoverCard>
              <span className="text-[10px] text-muted-foreground/70 shrink-0" suppressHydrationWarning>
                • {formatRelativeTime(reply.createdAt)}
              </span>
            </div>

            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(reply.id)}
                className="flex items-center gap-1 text-muted-foreground/70 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium cursor-pointer group/cmt-delete shrink-0"
                title="Delete reply"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground/70 group-hover/cmt-delete:text-rose-600" />
                {/* <span className="text-[11px]">Delete</span> */}
              </button>
            )}
          </div>

          {/* Reply Body Text */}
          <div className="py-0.5">
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal break-words whitespace-pre-line">
              {formatCommentBody(reply)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-0.5 text-xs">
            <LikeButton
              count={likesCount}
              isLiked={liked}
              onLike={toggleLike}
              variant="comment"
              size="sm"
            />

            {!isCommentingDisabled && (
              <button
                type="button"
                onClick={() => onInitiateReply(reply.author.name)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer group/cmt-reply"
                title="Reply to comment"
              >
                <MessageCircle className="w-3.5 h-3.5 transition-transform group-hover/cmt-reply:scale-110" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Level 3 Indented Thread (Nested Replies & Inline Form under Level 2 Comment) */}
      {((reply.replies && reply.replies.length > 0) || isSubThreadActive) && (
        <div className="pl-6 sm:pl-7 ml-4 sm:ml-5 relative space-y-3 pt-1">
          {/* Level 3 Vertical Thread Line */}
          <div className="absolute left-0 top-0 bottom-4 w-[2px] bg-border/60 -translate-x-1/2" />

          {/* Level 3 Sub-Reply Items */}
          {reply.replies &&
            reply.replies.map((subReply) => (
              <Level3ReplyItem
                key={subReply.id}
                subReply={subReply}
                isPostOwner={!!isPostOwner}
                isCommentingDisabled={isCommentingDisabled}
                onLike={onLike}
                onDelete={onDelete}
                onInitiateReply={onInitiateReply}
              />
            ))}

          {/* Level 3 Inline Reply Field */}
          {isSubThreadActive && !isCommentingDisabled && (
            <div className="relative flex items-center gap-2 pl-3 sm:pl-4 pt-1">
              <div className="absolute left-0 top-4 w-3 sm:w-4 h-3 border-l-2 border-b-2 border-border/60 rounded-bl-lg -translate-x-1/2" />

              <Avatar className="h-6 w-6 border border-border shrink-0 z-10 ring-2 ring-background">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <form
                onSubmit={handleSubFormSubmit}
                className="flex-1 bg-muted/40 dark:bg-muted/30 text-xs px-3 py-1 text-foreground rounded-full border border-border/80 focus-within:border-primary flex items-center gap-1.5 transition-all min-w-0"
              >
                {targetMentionAuthor && (
                  <span className="inline-flex items-center gap-1 bg-primary/15 text-primary font-semibold text-[11px] px-2 py-0.5 rounded-full shrink-0 select-none">
                    @{targetMentionAuthor}
                    <button
                      type="button"
                      onClick={() => setTargetMentionAuthor(null)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer text-primary"
                      title="Remove mention"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <input
                  ref={subInputRef}
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply as ${userName}...`}
                  className="flex-1 bg-transparent text-xs py-1 focus:outline-none placeholder:text-muted-foreground/70 min-w-0"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className={cn(
                    "p-1.5 rounded-full text-primary hover:bg-primary/10 transition-colors shrink-0",
                    !replyText.trim() && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  postAuthorId,
  postAuthorName,
  isCommentingDisabled = false,
  onLike,
  onDelete,
  activeReplyThreadId,
  setActiveReplyThreadId,
  targetMentionAuthor,
  setTargetMentionAuthor,
  replyText,
  setReplyText,
  onReplySubmit,
}: CommentItemProps) {
  const { data: session, status } = useSession();
  const { openGuestAuthModal } = useGuestAuthModal();
  const loggedInUser = session?.user;
  const userImage = loggedInUser?.image || "/logo.png";
  const userName = loggedInUser?.name || (loggedInUser as any)?.username || "Commuter";
  const userInitials = (userName[0] || "C").toUpperCase();

  const [liked, setLiked] = useState(comment.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(comment.upvoteCount);
  const replyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLiked(comment.isLiked ?? false);
    setLikesCount(comment.upvoteCount);
  }, [comment.isLiked, comment.upvoteCount]);

  const isCommentOwner =
    (loggedInUser?.id && comment.author.id === loggedInUser.id) ||
    (loggedInUser?.name && comment.author.name === loggedInUser.name) ||
    comment.author.id === "usr-current" ||
    comment.author.name === userName;

  const isPostOwner =
    (loggedInUser?.id && postAuthorId && postAuthorId === loggedInUser.id) ||
    (loggedInUser?.name && postAuthorName && postAuthorName === loggedInUser.name) ||
    (postAuthorName && postAuthorName === userName);

  const canDelete = isCommentOwner || isPostOwner;

  const toggleLike = async () => {
    if (status !== "authenticated") {
      openGuestAuthModal({
        title: "Mag-sign In Para Mag-like",
        description: "Kailangan ng account para makapag-like ng commute guides at sagot.",
        icon: "heart",
      });
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    onLike(comment.id);

    try {
      await toggleAnswerVoteAction(comment.id);
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleReplyMother = () => {
    if (status !== "authenticated") {
      openGuestAuthModal({
        title: "Mag-sign In Para Mag-reply",
        description: "Kailangan ng account para makapag-reply sa sagot.",
        icon: "lock",
      });
      return;
    }
    if (activeReplyThreadId === comment.id && targetMentionAuthor === comment.author.name) {
      setActiveReplyThreadId(null);
      setTargetMentionAuthor(null);
    } else {
      setActiveReplyThreadId(comment.id);
      setTargetMentionAuthor(comment.author.name);
      setTimeout(() => replyInputRef.current?.focus(), 50);
    }
  };

  const handleReplySubChild = (childReplyId: string, childAuthorName: string) => {
    if (status !== "authenticated") {
      openGuestAuthModal({
        title: "Mag-sign In Para Mag-reply",
        description: "Kailangan ng account para makapag-reply sa sagot.",
        icon: "lock",
      });
      return;
    }
    setActiveReplyThreadId(childReplyId);
    setTargetMentionAuthor(childAuthorName);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplySubmit(comment.id, targetMentionAuthor || undefined);
  };

  const isThreadActive = activeReplyThreadId === comment.id;

  return (
    <div className="space-y-3 relative hover:z-30">
      {/* Mother Comment Header & Bubble */}
      <div className="flex items-start gap-2.5 sm:gap-3 relative">
        <UserHoverCard author={comment.author}>
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border/50 shrink-0 mt-0.5 ring-2 ring-background">
            <AvatarImage
              src={comment.author.avatarUrl}
              alt={comment.author.name}
            />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
              {(comment.author.name || "C").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </UserHoverCard>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
              <UserHoverCard author={comment.author}>
                <span className="text-xs sm:text-sm font-bold text-foreground hover:underline truncate">
                  {comment.author.name}
                </span>
              </UserHoverCard>
              <span className="text-[10px] text-muted-foreground/70 shrink-0" suppressHydrationWarning>
                • {formatRelativeTime(comment.createdAt)}
              </span>

              {comment.isVerified && (
                <span className="text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0 ml-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Best Answer
                </span>
              )}
            </div>

            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-muted-foreground/70 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium cursor-pointer group/cmt-delete shrink-0"
                title="Delete answer"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground/70 group-hover/cmt-delete:text-rose-600" />
                {/* <span className="text-[11px]">Delete</span> */}
              </button>
            )}
          </div>

          {/* Comment Body Text */}
          <div className="py-0.5">
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal break-words whitespace-pre-line">
              {formatCommentBody(comment)}
            </p>
          </div>

          {/* Comment Actions: Like & Reply */}
          <div className="flex items-center gap-3 pt-0.5 text-xs">
            <LikeButton
              count={likesCount}
              isLiked={liked}
              onLike={toggleLike}
              variant="comment"
              size="md"
            />

            {!isCommentingDisabled && (
              <button
                type="button"
                onClick={handleReplyMother}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer group/cmt-reply"
                title="Reply to comment"
              >
                <MessageCircle className="w-3.5 h-3.5 transition-transform group-hover/cmt-reply:scale-110" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Indented Thread Replies Container with Visual Connector Line & Curved Elbows */}
      {((comment.replies && comment.replies.length > 0) || isThreadActive) && (
        <div className="pl-4 sm:pl-4.5 ml-4 sm:ml-4.5 relative space-y-3 pt-1">
          {/* Continuous Vertical Thread Connector Line */}
          <div className="absolute left-0 top-0 bottom-4 w-[2px] bg-border/70 -translate-x-1/2" />

          {/* Level 2 Child Reply Items */}
          {comment.replies &&
            comment.replies.map((reply) => (
              <SubReplyItem
                key={reply.id}
                reply={reply}
                postAuthorId={postAuthorId}
                postAuthorName={postAuthorName}
                isCommentingDisabled={isCommentingDisabled}
                onLike={onLike}
                onDelete={onDelete}
                onInitiateReply={(targetAuthorName) => handleReplySubChild(reply.id, targetAuthorName)}
                activeReplyThreadId={activeReplyThreadId}
                targetMentionAuthor={targetMentionAuthor}
                setTargetMentionAuthor={setTargetMentionAuthor}
                replyText={replyText}
                setReplyText={setReplyText}
                onReplySubmit={onReplySubmit}
              />
            ))}

          {/* Thread Inline Reply Form ("Reply as [User]") */}
          {isThreadActive && !isCommentingDisabled && (
            <div className="relative flex items-center gap-2 pl-3 sm:pl-4 pt-1">
              {/* Curved Branch Elbow for Reply Input */}
              <div className="absolute left-0 top-4 w-3 sm:w-4 h-3 border-l-2 border-b-2 border-border/70 rounded-bl-lg -translate-x-1/2" />

              <Avatar className="h-7 w-7 border border-border shrink-0 z-10 ring-2 ring-background">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <form
                onSubmit={handleFormSubmit}
                className="flex-1 bg-muted/40 dark:bg-muted/30 text-xs px-3 py-1.5 text-foreground rounded-full border border-border/80 focus-within:border-primary flex items-center gap-1.5 transition-all min-w-0"
              >
                {targetMentionAuthor && (
                  <span className="inline-flex items-center gap-1 bg-primary/15 text-primary font-semibold text-[11px] px-2 py-0.5 rounded-full shrink-0 select-none">
                    @{targetMentionAuthor}
                    <button
                      type="button"
                      onClick={() => setTargetMentionAuthor(null)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer text-primary"
                      title="Remove mention tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <input
                  ref={replyInputRef}
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply as ${userName}...`}
                  className="flex-1 bg-transparent text-xs py-1 focus:outline-none placeholder:text-muted-foreground/70 min-w-0"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className={cn(
                    "p-1.5 rounded-full text-primary hover:bg-primary/10 transition-colors shrink-0",
                    !replyText.trim() && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PostCard({ post, isHighlighted = false, onVote, onBookmark }: PostCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const loggedInUser = session?.user;
  const currentUserImage = loggedInUser?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  const currentUserName = loggedInUser?.name || (loggedInUser as any)?.username || "Lance Pallesco";
  const currentUserInitials = currentUserName.substring(0, 2).toUpperCase();

  const [postData, setPostData] = useState<Post>(post);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommentingDisabled, setIsCommentingDisabled] = useState(post.isCommentingDisabled ?? false);
  const [isPostDeleteModalOpen, setIsPostDeleteModalOpen] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  useEffect(() => {
    setPostData(post);
    setIsCommentingDisabled(post.isCommentingDisabled ?? false);
  }, [post]);

  const isVerified = postData.status === "verified";
  const isPinned = postData.status === "pinned";
  const isLiked = postData.userVoteState === "up";
  const isPostOwner =
    (loggedInUser?.id && postData.author.id === loggedInUser.id) ||
    (loggedInUser?.name && postData.author.name === loggedInUser.name) ||
    postData.author.name === currentUserName ||
    postData.author.id === "usr-current";

  const handleEditPost = () => {
    setIsEditModalOpen(true);
  };

  const handleToggleCommenting = async () => {
    const nextState = !isCommentingDisabled;
    setIsCommentingDisabled(nextState);
    toast.success(nextState ? "Commenting turned off for this post." : "Commenting enabled.");
    try {
      await toggleCommentingAction(post.id);
      router.refresh();
    } catch (err) {
      console.error("Error toggling commenting:", err);
    }
  };

  const confirmDeletePost = async () => {
    setIsDeletingPost(true);
    try {
      const res = await deletePostAction(post.id);
      if (res.success) {
        toast.success("Post deleted");
        setIsPostDeleteModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete post.");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    } finally {
      setIsDeletingPost(false);
    }
  };

  const { openGuestAuthModal } = useGuestAuthModal();
  const [isBookmarkedState, setIsBookmarkedState] = useState(post.isBookmarked ?? false);
  const [postComments, setPostComments] = useState<Comment[]>(post.comments || []);
  const [isExpanded, setIsExpanded] = useState(isHighlighted);
  const [newComment, setNewComment] = useState("");
  const [activeReplyThreadId, setActiveReplyThreadId] = useState<string | null>(null);
  const [targetMentionAuthor, setTargetMentionAuthor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (isHighlighted) {
      setIsExpanded(true);
    }
  }, [isHighlighted]);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handlePostLike = () => {
    if (status !== "authenticated") {
      openGuestAuthModal({
        title: "Mag-sign In Para Mag-like",
        description: "Kailangan ng account para makapag-like ng commute guides at tanong.",
        icon: "heart",
      });
      return;
    }
    onVote(post.id);
  };

  const handleBookmarkToggle = () => {
    if (status !== "authenticated") {
      openGuestAuthModal({
        title: "Mag-sign In Para Mag-save",
        description: "Kailangan ng account para ma-save ang commute routes sa iyong profile.",
        icon: "bookmark",
      });
      return;
    }
    const nextState = !isBookmarkedState;
    setIsBookmarkedState(nextState);
    onBookmark(post.id);
    toast.success(nextState ? "Post saved to bookmarks!" : "Post removed from bookmarks");
  };

  const requestDeleteComment = (commentId: string) => {
    setDeleteTargetId(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    await handleDeleteComment(deleteTargetId);
    setIsDeleting(false);
    setDeleteTargetId(null);
  };

  const getTotalCommentCount = (comments: Comment[]): number => {
    let count = 0;
    for (const c of comments) {
      count += 1;
      if (c.replies && c.replies.length > 0) {
        count += getTotalCommentCount(c.replies);
      }
    }
    return count;
  };

  const totalComments = getTotalCommentCount(postComments) || post.answerCount;

  const handleShareLink = async () => {
    const url = getCurrentUrl();
    await copyToClipboard(url);
    toast.success("Direct link copied to clipboard!");
  };

  const handleReportPost = () => {
    toast.info("Report submitted. Our moderators will review this post.");
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated") {
      openGuestAuthModal({
        title: "Mag-sign In Para Sumagot",
        description: "Kailangan ng account para makapagbahagi ng commute guide at sagot.",
        icon: "plus",
      });
      return;
    }
    if (!newComment.trim()) return;

    const currentText = newComment.trim();
    setNewComment("");

    const createdComment: Comment = {
      id: `comment-${Date.now()}`,
      postId: post.id,
      author: {
        id: loggedInUser?.id || "usr-current",
        name: currentUserName,
        username: (loggedInUser as any)?.username || "commuter",
        avatarUrl: currentUserImage,
        reputationPoints: 100,
        verifiedAnswersCount: 0,
      },
      body: currentText,
      createdAt: new Date().toISOString(),
      upvoteCount: 0,
      replies: [],
    };

    setPostComments((prev) => [createdComment, ...prev]);
    setIsExpanded(true);
    toast.success("Answer submitted!");

    try {
      const res = await createAnswerAction({
        postId: post.id,
        body: currentText,
      });
      if (res.success && res.answer?.id) {
        setPostComments((prev) =>
          prev.map((c) => (c.id === createdComment.id ? { ...c, id: res.answer.id } : c))
        );
        router.refresh();
      }
    } catch (err) {
      console.error("Error persisting answer:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const removeCommentRecursively = (list: Comment[]): Comment[] => {
      return list
        .filter((c) => c.id !== commentId)
        .map((c) => ({
          ...c,
          replies: c.replies ? removeCommentRecursively(c.replies) : [],
        }));
    };

    setPostComments((prev) => removeCommentRecursively(prev));
    toast.success("Answer deleted");

    try {
      const res = await deleteAnswerAction(commentId);
      if (res.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error deleting answer:", err);
    }
  };

  const handleReplySubmit = async (parentId: string, parentAuthorName?: string) => {
    if (!replyText.trim()) return;

    const currentText = replyText.trim();
    setReplyText("");
    setActiveReplyThreadId(null);
    setTargetMentionAuthor(null);

    const validParentAuthorName =
      parentAuthorName && parentAuthorName !== "undefined" && parentAuthorName !== "null"
        ? parentAuthorName
        : undefined;

    let finalBodyText = currentText;
    if (validParentAuthorName) {
      const escapedName = validParentAuthorName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const hasPrefix = new RegExp(`^@${escapedName}\\s*`, "i").test(currentText);
      if (!hasPrefix) {
        finalBodyText = `@${validParentAuthorName} ${currentText}`;
      }
    }

    finalBodyText = finalBodyText.replace(/@undefined\s*/gi, "").replace(/@null\s*/gi, "").trim();

    const createdReply: Comment = {
      id: `reply-${Date.now()}`,
      postId: post.id,
      parentId: parentId,
      parentAuthorName: validParentAuthorName,
      author: {
        id: loggedInUser?.id || "usr-current",
        name: currentUserName,
        username: (loggedInUser as any)?.username || "commuter",
        avatarUrl: currentUserImage,
        reputationPoints: 100,
        verifiedAnswersCount: 0,
      },
      body: finalBodyText,
      createdAt: new Date().toISOString(),
      upvoteCount: 0,
    };

    const addReplyRecursively = (list: Comment[]): Comment[] => {
      return list.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            replies: [...(item.replies || []), createdReply],
          };
        }
        if (item.replies && item.replies.length > 0) {
          return {
            ...item,
            replies: addReplyRecursively(item.replies),
          };
        }
        return item;
      });
    };

    setPostComments((prev) => addReplyRecursively(prev));
    setIsExpanded(true);
    toast.success("Reply submitted!");

    try {
      const res = await createAnswerAction({
        postId: post.id,
        parentId: parentId,
        body: finalBodyText,
      });
      if (res.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error persisting reply:", err);
    }
  };

  const handleCommentUpvote = (commentId: string) => {
    const updateLikeRecursively = (list: Comment[]): Comment[] => {
      return list.map((item) => {
        if (item.id === commentId) {
          const nextIsLiked = !item.isLiked;
          return {
            ...item,
            isLiked: nextIsLiked,
            upvoteCount: nextIsLiked ? item.upvoteCount + 1 : Math.max(0, item.upvoteCount - 1),
          };
        }
        if (item.replies && item.replies.length > 0) {
          return {
            ...item,
            replies: updateLikeRecursively(item.replies),
          };
        }
        return item;
      });
    };

    setPostComments((prev) => updateLikeRecursively(prev));
  };

  const sortedMotherComments = [...postComments].sort((a, b) => {
    // Tier 1: Verified Best Answer first (pinned to top)
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;

    // Tier 2: Upvote count descending
    if (b.upvoteCount !== a.upvoteCount) {
      return b.upvoteCount - a.upvoteCount;
    }

    // Tier 3: Discussion engagement - Reply count descending
    const aRepliesCount = a.replies?.length || 0;
    const bRepliesCount = b.replies?.length || 0;
    if (bRepliesCount !== aRepliesCount) {
      return bRepliesCount - aRepliesCount;
    }

    // Tier 4: Created date descending (tiebreaker)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const topMotherComment = sortedMotherComments[0];
  const remainingMotherComments = sortedMotherComments.slice(1);

  return (
    <article ref={cardRef} className="group scroll-mt-24">
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-sm border-border/70 overflow-hidden bg-card",
          isPinned && "border-primary/40 bg-primary/[0.02]"
        )}
      >
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <UserInfo
              author={post.author}
              createdAt={post.createdAt}
              isVerified={isVerified}
            />
            <div className="flex items-center gap-1 shrink-0">
              {isPinned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full mr-1">
                  <Pin className="w-3 h-3 fill-current" />
                  Pinned
                </span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none transition-colors cursor-pointer"
                  aria-label="Post options"
                >
                  <MoreHorizontal className="w-4.5 h-4.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 select-none">
                  {isPostOwner ? (
                    <>
                      <DropdownMenuItem onClick={handleEditPost} className="cursor-pointer gap-2.5">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                        <span>Edit post</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleToggleCommenting} className="cursor-pointer gap-2.5">
                        <MessageSquareOff className="w-4 h-4 text-muted-foreground" />
                        <span>{isCommentingDisabled ? "Turn on commenting" : "Turn off commenting"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsPostDeleteModalOpen(true)}
                        className="cursor-pointer gap-2.5 text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10 font-medium"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>Delete post</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={handleBookmarkToggle} className="cursor-pointer gap-2.5">
                        <Bookmark className={cn("w-4 h-4", isBookmarkedState && "fill-primary text-primary")} />
                        <span>{isBookmarkedState ? "Saved in Bookmarks" : "Save post"}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShareLink} className="cursor-pointer gap-2.5">
                        <Share2 className="w-4 h-4" />
                        <span>Share link</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleReportPost}
                        className="cursor-pointer gap-2.5 text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10 font-medium"
                      >
                        <Flag className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>Report post</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <h2 className="text-lg sm:text-lg font-black text-[#3D3C3A] dark:text-[#E2E2E2] tracking-tight transition-colors cursor-pointer leading-snug break-words whitespace-pre-line">
            {postData.title}
          </h2>

          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal break-words whitespace-pre-line">
            {postData.body}
          </p>

          <div className="pt-0.5">
            <PostRouteDisplay origin={postData.origin} destination={postData.destination} />
          </div>

          {postData.transportModes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] text-muted-foreground/70 font-medium pr-1">Modes:</span>
              {postData.transportModes.map((mode) => (
                <TransportBadge key={mode} mode={mode} />
              ))}
            </div>
          )}

          {postData.tags && postData.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] text-muted-foreground/70 font-medium pr-1">Tags:</span>
              {postData.tags.map((tagName) => (
                <span
                  key={tagName}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/feed?tag=${encodeURIComponent(tagName)}`);
                  }}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
                >
                  {tagName}
                </span>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-0.5 select-none">
            <div className="flex items-center gap-5 sm:gap-6">
              <LikeButton
                count={post.upvoteCount}
                isLiked={isLiked}
                onLike={handlePostLike}
                variant="post"
              />

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium cursor-pointer group/comment"
                title="Comments"
              >
                <MessageCircle className="w-4 h-4 text-muted-foreground transition-transform group-hover/comment:scale-110" />
                <span className="font-semibold text-foreground">{totalComments}</span>
              </button>
            </div>

            <div className="flex items-center gap-4 sm:gap-5">
              <button
                type="button"
                onClick={handleBookmarkToggle}
                className={cn(
                  "hover:text-primary transition-colors cursor-pointer group/save p-1 rounded-md hover:bg-muted",
                  isBookmarkedState && "text-primary"
                )}
                title="Bookmark post"
              >
                <Bookmark
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform group-hover/save:scale-110",
                    isBookmarkedState && "fill-primary text-primary"
                  )}
                />
              </button>
              <button
                type="button"
                onClick={handleShareLink}
                className="hover:text-foreground transition-colors cursor-pointer group/share p-1 rounded-md hover:bg-muted"
                title="Share link"
              >
                <Share2 className="w-4 h-4 text-muted-foreground transition-transform group-hover/share:scale-110" />
              </button>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="pt-2">
              <Link
                href="/"
                className="block text-center text-xs font-semibold text-muted-foreground/80 hover:text-foreground bg-muted/30 hover:bg-muted/60 py-2.5 px-4 rounded-2xl border border-border/60 transition-all cursor-pointer"
              >
                {totalComments > 0
                  ? `Sign in to view ${totalComments} ${totalComments === 1 ? "answer" : "answers"} & community discussion.`
                  : "Sign in to view answers & community discussion."}
              </Link>
            </div>
          ) : (
            <>
              {topMotherComment && (
                <div className="pt-2 space-y-2.5">
                  <CommentItem
                    comment={topMotherComment}
                    postAuthorId={post.author.id}
                    postAuthorName={post.author.name}
                    isCommentingDisabled={isCommentingDisabled}
                    onLike={handleCommentUpvote}
                    onDelete={requestDeleteComment}
                    activeReplyThreadId={activeReplyThreadId}
                    setActiveReplyThreadId={setActiveReplyThreadId}
                    targetMentionAuthor={targetMentionAuthor}
                    setTargetMentionAuthor={setTargetMentionAuthor}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onReplySubmit={(motherId, authorName) => {
                      handleReplySubmit(motherId, authorName);
                      setActiveReplyThreadId(null);
                      setTargetMentionAuthor(null);
                    }}
                  />

                  {isExpanded && remainingMotherComments.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {remainingMotherComments.map((motherComment) => (
                        <CommentItem
                          key={motherComment.id}
                          comment={motherComment}
                          postAuthorId={post.author.id}
                          postAuthorName={post.author.name}
                          isCommentingDisabled={isCommentingDisabled}
                          onLike={handleCommentUpvote}
                          onDelete={requestDeleteComment}
                          activeReplyThreadId={activeReplyThreadId}
                          setActiveReplyThreadId={setActiveReplyThreadId}
                          targetMentionAuthor={targetMentionAuthor}
                          setTargetMentionAuthor={setTargetMentionAuthor}
                          replyText={replyText}
                          setReplyText={setReplyText}
                          onReplySubmit={(motherId, authorName) => {
                            handleReplySubmit(motherId, authorName);
                            setActiveReplyThreadId(null);
                            setTargetMentionAuthor(null);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {remainingMotherComments.length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Hide answers</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>
                              View {remainingMotherComments.length} more{" "}
                              {remainingMotherComments.length === 1 ? "answer" : "answers"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isCommentingDisabled ? (
                <div className="pt-2 text-center text-xs font-semibold text-muted-foreground/70 bg-muted/30 py-2.5 rounded-2xl border border-border/60">
                  Commenting has been turned off by the post author.
                </div>
              ) : (
                <div className="pt-2">
                  <AdaptiveCommentInput
                    value={newComment}
                    onChange={setNewComment}
                    onSubmit={handleCommentSubmit}
                    userImage={currentUserImage}
                    userName={currentUserName}
                    placeholder={`Answer as ${currentUserName}...`}
                    submitButtonText="Post Answer"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteComment}
        title="Delete Answer?"
        description="Are you sure you want to delete this commute answer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={isPostDeleteModalOpen}
        onClose={() => setIsPostDeleteModalOpen(false)}
        onConfirm={confirmDeletePost}
        title="Delete Post?"
        description="Are you sure you want to delete this commute post? All associated answers and comments will be permanently removed."
        confirmText="Delete Post"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingPost}
      />

      <PostFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        initialValues={{
          postId: postData.id,
          title: postData.title,
          body: postData.body,
          origin: postData.origin,
          destination: postData.destination,
          selectedTags: postData.transportModes,
        }}
        onSuccess={(updatedFields) =>
          setPostData((prev) => ({ ...prev, ...updatedFields }))
        }
      />
    </article>
  );
}
