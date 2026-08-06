"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { Post, Comment } from "@/types";
import { formatRelativeTime } from "@/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { UserInfo } from "@/components/shared/user-info";
import { TransportBadge } from "@/components/shared/transport-badge";
import { PostRouteDisplay } from "./post-route-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createAnswerAction, deleteAnswerAction } from "@/app/actions/answer-actions";
import { ConfirmModal } from "@/components/shared/confirm-modal";

interface PostCardProps {
  post: Post;
  onVote: (postId: string, direction: "up" | "down") => void;
  onBookmark: (postId: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  postAuthorId?: string;
  postAuthorName?: string;
  isMother?: boolean;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onReplySubmit: (parentId: string, authorName: string) => void;
}

function formatCommentBody(body: string) {
  const parts = body.split(/(@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?)/g);
  if (parts.length <= 1) return body;

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("@")) {
          return (
            <span
              key={i}
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

function CommentItem({
  comment,
  postAuthorId,
  postAuthorName,
  isMother = false,
  onLike,
  onDelete,
  replyingToId,
  setReplyingToId,
  replyText,
  setReplyText,
  onReplySubmit,
}: CommentItemProps) {
  const { data: session } = useSession();
  const loggedInUser = session?.user;
  const userImage = loggedInUser?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  const userName = loggedInUser?.name || (loggedInUser as any)?.username || "Lance Pallesco";
  const userInitials = userName.substring(0, 2).toUpperCase();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.upvoteCount);
  const [showReplies, setShowReplies] = useState(false);

  // Ownership Check: Authorized if user is Comment Owner OR Post Owner
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

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    onLike(comment.id);
  };

  const isReplying = replyingToId === comment.id;

  return (
    <div className="space-y-2">
      {/* Side-by-Side Comment Layout: Avatar (Left) + Content (Right) */}
      <div className="flex items-start gap-3">
        {/* Left Column: Mid-Large Avatar */}
        <Avatar
          className={cn(
            "border border-border/50 shrink-0 mt-0.5",
            isMother ? "h-8 w-8 sm:h-9 sm:w-9" : "h-7 w-7 sm:h-8 sm:w-8"
          )}
        >
          <AvatarImage
            src={comment.author.avatarUrl}
            alt={comment.author.name}
          />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
            {comment.author.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Right Column: Name, Badge, Time, Body Text, Reactions */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header Line */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                {comment.author.name}
              </span>
              <span className="text-[10px] text-muted-foreground/70 shrink-0">
                • {formatRelativeTime(comment.createdAt)}
              </span>

              {comment.isVerified && (
                <span className="text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 shrink-0 ml-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Best Answer
                </span>
              )}
            </div>

            {/* Delete Button (Allowed ONLY for Comment Owner or Post Owner) */}
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-muted-foreground/70 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium cursor-pointer group/cmt-delete shrink-0"
                title="Delete answer"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground/70 group-hover/cmt-delete:text-rose-600" />
                <span className="text-[11px]">Delete</span>
              </button>
            )}
          </div>

          {/* Comment Body Text */}
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal pt-0.5">
            {formatCommentBody(comment.body)}
          </p>

          {/* Comment Actions: Heart Like & Reply */}
          <div className="flex items-center gap-3 pt-1 text-xs">
            {/* Heart Like Button */}
            <button
              type="button"
              onClick={toggleLike}
              className={cn(
                "flex items-center gap-1.5 transition-colors cursor-pointer group/cmt-heart",
                liked && "text-rose-500 font-semibold"
              )}
              title="Like comment"
            >
              <Heart
                className={cn(
                  "w-3.5 h-3.5 transition-transform group-hover/cmt-heart:scale-110",
                  liked
                    ? "fill-rose-500 text-rose-500"
                    : "text-muted-foreground group-hover/cmt-heart:text-rose-500"
                )}
              />
              <span className={cn(liked ? "text-rose-500" : "text-muted-foreground font-medium")}>
                {likesCount}
              </span>
            </button>

            {/* Reply Button (Only for Mother Comments) */}
            {isMother && (
              <button
                type="button"
                onClick={() => setReplyingToId(isReplying ? null : comment.id)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer group/cmt-reply"
                title="Reply to comment"
              >
                <MessageCircle className="w-3.5 h-3.5 transition-transform group-hover/cmt-reply:scale-110" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Inline Reply Form */}
          {isReplying && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onReplySubmit(comment.id, comment.author.name);
              }}
              className="mt-2.5 pt-2 flex items-center gap-2"
            >
              <Avatar className="h-7 w-7 border border-border shrink-0">
                <AvatarImage
                  src={userImage}
                  alt={userName}
                />
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to @${comment.author.name}...`}
                className="flex-1 bg-muted/40 text-xs px-3.5 py-1.5 rounded-full border border-border/80 focus:outline-none focus:border-primary placeholder:text-muted-foreground/70"
                autoFocus
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className={cn(
                  "p-1.5 rounded-full text-primary hover:bg-primary/10 transition-colors",
                  !replyText.trim() && "opacity-40 cursor-not-allowed"
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Nested Child Replies Toggle & Tree */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 pt-1 pl-11">
          <button
            type="button"
            onClick={() => setShowReplies((prev) => !prev)}
            className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showReplies && "rotate-180")} />
            {showReplies
              ? "Hide replies"
              : `View ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`}
          </button>

          {showReplies && (
            <div className="border-l-2 border-border/40 space-y-2 pt-1 pl-3 sm:pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isMother={false}
                  onLike={onLike}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onReplySubmit={onReplySubmit}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PostCard({ post, onVote, onBookmark }: PostCardProps) {
  const { data: session } = useSession();
  const loggedInUser = session?.user;
  const currentUserImage = loggedInUser?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  const currentUserName = loggedInUser?.name || (loggedInUser as any)?.username || "Lance Pallesco";
  const currentUserInitials = currentUserName.substring(0, 2).toUpperCase();

  const isVerified = post.status === "verified";
  const isPinned = post.status === "pinned";
  const isLiked = post.userVoteState === "up";

  const [isBookmarkedState, setIsBookmarkedState] = useState(post.isBookmarked ?? false);
  const [postComments, setPostComments] = useState<Comment[]>(post.comments || []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  const handleBookmarkToggle = () => {
    const nextState = !isBookmarkedState;
    setIsBookmarkedState(nextState);
    onBookmark(post.id);
    toast.success(nextState ? "Post saved to bookmarks!" : "Post removed from bookmarks");
  };

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText?.(window.location.href);
    }
    toast.success("Direct link copied to clipboard!");
  };

  const handleReportPost = () => {
    toast.info("Report submitted. Our moderators will review this post.");
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const nextComments = [createdComment, ...postComments];
    setPostComments(nextComments);
    setIsExpanded(true);
    toast.success("Answer submitted!");

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("komyut:update-comments", {
          detail: { postId: post.id, comments: nextComments, answerCount: nextComments.length },
        })
      );
    }, 0);

    try {
      const res = await createAnswerAction({
        postId: post.id,
        body: currentText,
      });
      if (res.success && res.answer?.id) {
        setPostComments((prev) =>
          prev.map((c) => (c.id === createdComment.id ? { ...c, id: res.answer.id } : c))
        );
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

    const nextComments = removeCommentRecursively(postComments);
    setPostComments(nextComments);
    toast.success("Answer deleted");

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("komyut:update-comments", {
          detail: { postId: post.id, comments: nextComments, answerCount: nextComments.length },
        })
      );
    }, 0);

    try {
      await deleteAnswerAction(commentId);
    } catch (err) {
      console.error("Error deleting answer:", err);
    }
  };

  const handleReplySubmit = (parentId: string, parentAuthorName: string) => {
    if (!replyText.trim()) return;

    const createdReply: Comment = {
      id: `reply-${Date.now()}`,
      postId: post.id,
      parentId: parentId,
      author: {
        id: loggedInUser?.id || "usr-current",
        name: currentUserName,
        username: (loggedInUser as any)?.username || "commuter",
        avatarUrl: currentUserImage,
        reputationPoints: 100,
        verifiedAnswersCount: 0,
      },
      body: `@${parentAuthorName} ${replyText.trim()}`,
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

    const nextComments = addReplyRecursively(postComments);
    setPostComments(nextComments);
    setReplyText("");
    setReplyingToId(null);
    setIsExpanded(true);

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("komyut:update-comments", {
          detail: { postId: post.id, comments: nextComments, answerCount: nextComments.length },
        })
      );
    }, 0);
  };

  const handleCommentUpvote = (commentId: string) => {};

  const sortedMotherComments = [...postComments].sort((a, b) => {
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;
    return b.upvoteCount - a.upvoteCount;
  });

  const topMotherComment = sortedMotherComments[0];
  const remainingMotherComments = sortedMotherComments.slice(1);

  return (
    <article className="group">
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
                <DropdownMenuContent align="end" className="w-48">
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
                    className="cursor-pointer gap-2.5 text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10"
                  >
                    <Flag className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Report post</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <h2 className="text-lg sm:text-lg font-black text-[#3D3C3A] dark:text-[#E2E2E2] tracking-tight transition-colors cursor-pointer leading-snug break-words">
            {post.title}
          </h2>

          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal">
            {post.body}
          </p>

          <div className="pt-0.5">
            <PostRouteDisplay origin={post.origin} destination={post.destination} />
          </div>

          {post.transportModes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] text-muted-foreground/70 font-medium pr-1">Modes:</span>
              {post.transportModes.map((mode) => (
                <TransportBadge key={mode} mode={mode} />
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-0.5 select-none">
            <div className="flex items-center gap-5 sm:gap-6">
              <button
                type="button"
                onClick={() => onVote(post.id, "up")}
                className="flex items-center gap-1.5 hover:text-rose-500 transition-colors font-medium cursor-pointer group/heart"
                title="Like question"
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-transform group-hover/heart:scale-110",
                    isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                  )}
                />
                <span className={cn("font-semibold", isLiked ? "text-rose-500" : "")}>{post.upvoteCount}</span>
              </button>

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

          {topMotherComment && (
            <div className="pt-2 space-y-2.5">
              {/* 1. Top Answer */}
              <CommentItem
                comment={topMotherComment}
                postAuthorId={post.author.id}
                postAuthorName={post.author.name}
                isMother={true}
                onLike={handleCommentUpvote}
                onDelete={requestDeleteComment}
                replyingToId={replyingToId}
                setReplyingToId={setReplyingToId}
                replyText={replyText}
                setReplyText={setReplyText}
                onReplySubmit={handleReplySubmit}
              />

              {/* 2. Remaining Answers List */}
              {isExpanded && remainingMotherComments.length > 0 && (
                <div className="space-y-3 pt-1">
                  {remainingMotherComments.map((motherComment) => (
                    <CommentItem
                      key={motherComment.id}
                      comment={motherComment}
                      postAuthorId={post.author.id}
                      postAuthorName={post.author.name}
                      isMother={true}
                      onLike={handleCommentUpvote}
                      onDelete={requestDeleteComment}
                      replyingToId={replyingToId}
                      setReplyingToId={setReplyingToId}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      onReplySubmit={handleReplySubmit}
                    />
                  ))}
                </div>
              )}

              {/* 3. Toggle Button Placed Below All Answers */}
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

          <form onSubmit={handleCommentSubmit} className="pt-2 flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-border shrink-0">
              <AvatarImage
                src={currentUserImage}
                alt={currentUserName}
              />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                {currentUserInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Magbigay ng sagot..."
                className="w-full bg-muted/40 hover:bg-muted/70 focus:bg-background text-xs sm:text-sm px-4 py-2.5 pr-12 rounded-full border border-border/80 focus:outline-none focus:border-primary/80 transition-all placeholder:text-muted-foreground/70"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-3 p-1 text-primary disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Popup Modal */}
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
    </article>
  );
}
