"use client";

import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
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
  onVote: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  postAuthorId?: string;
  postAuthorName?: string;
  isMother?: boolean;
  isCommentingDisabled?: boolean;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onReplySubmit: (parentId: string, authorName?: string) => void;
}

function formatCommentBody(comment: Comment) {
  const body = comment.body || "";

  if (comment.parentAuthorName) {
    const cleanBody = body.replace(new RegExp(`^@${comment.parentAuthorName}\\s*`, "i"), "").trim();
    return (
      <>
        <span className="font-semibold text-primary hover:underline cursor-pointer mr-1">
          @{comment.parentAuthorName}
        </span>
        {cleanBody || body}
      </>
    );
  }

  if (body.startsWith("@")) {
    const spaceIndex = body.indexOf(" ");
    if (spaceIndex !== -1) {
      const parts = body.split(/^(@[^\n\r]+?)(?=\s+(?:[a-z0-9\W]|sabay|thanks|thank|salamat|sakay|baba|tawid|mabilis|okay|ok|goods|hindi|oo|pa|na|ba|toy|po|din|rin|yung|ako|ikaw|mo|ko|to|ito|ano|saan|paano|mga|sa|ng|pala|kasi|dapat)|\s*$)/iu);
      if (parts.length > 1) {
        return (
          <>
            <span className="font-semibold text-primary hover:underline cursor-pointer">
              {parts[1]}
            </span>
            {parts[2] || ""}
          </>
        );
      }
    }
  }

  return body;
}

function CommentItem({
  comment,
  postAuthorId,
  postAuthorName,
  isMother = false,
  isCommentingDisabled = false,
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

  const [liked, setLiked] = useState(comment.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(comment.upvoteCount);
  const [showReplies, setShowReplies] = useState(false);
  const [includeMention, setIncludeMention] = useState(true);

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

  const isReplying = replyingToId === comment.id;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
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

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                {comment.author.name}
              </span>
              <span className="text-[10px] text-muted-foreground/70 shrink-0" suppressHydrationWarning>
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
            {formatCommentBody(comment)}
          </p>

          {/* Comment Actions: Heart Like & Reply */}
          <div className="flex items-center gap-3 pt-1 text-xs">
            {/* Reusable LikeButton Component */}
            <LikeButton
              count={likesCount}
              isLiked={liked}
              onLike={toggleLike}
              variant="comment"
              size={isMother ? "md" : "sm"}
            />

            {/* Reply Button (Only for Mother Comments when commenting is enabled) */}
            {isMother && !isCommentingDisabled && (
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
                onReplySubmit(comment.id, includeMention ? comment.author.name : undefined);
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
              <div className="flex-1 bg-muted/40 text-xs px-3 py-1 text-foreground rounded-full border border-border/80 focus-within:border-primary flex items-center gap-1.5 transition-all min-w-0">
                {includeMention && (
                  <span className="inline-flex items-center gap-1 bg-primary/15 text-primary font-semibold text-[11px] px-2 py-0.5 rounded-full shrink-0 select-none">
                    @{comment.author.name}
                    <button
                      type="button"
                      onClick={() => setIncludeMention(false)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer text-primary"
                      title="Remove mention tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={includeMention ? "Write a reply..." : `Reply to @${comment.author.name}...`}
                  className="flex-1 bg-transparent text-xs py-1 focus:outline-none placeholder:text-muted-foreground/70 min-w-0"
                  autoFocus
                />
              </div>
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
  const router = useRouter();
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
    setReplyingToId(null);

    const finalBodyText = parentAuthorName ? `@${parentAuthorName} ${currentText}` : currentText;

    const createdReply: Comment = {
      id: `reply-${Date.now()}`,
      postId: post.id,
      parentId: parentId,
      parentAuthorName: parentAuthorName,
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
        body: `@${parentAuthorName} ${currentText}`,
      });
      if (res.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error persisting reply:", err);
    }
  };

  const handleCommentUpvote = (commentId: string) => { };

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

          <h2 className="text-lg sm:text-lg font-black text-[#3D3C3A] dark:text-[#E2E2E2] tracking-tight transition-colors cursor-pointer leading-snug break-words">
            {postData.title}
          </h2>

          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal">
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
                onLike={() => onVote(post.id)}
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
                    isMother={true}
                    isCommentingDisabled={isCommentingDisabled}
                    onLike={handleCommentUpvote}
                    onDelete={requestDeleteComment}
                    replyingToId={replyingToId}
                    setReplyingToId={setReplyingToId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onReplySubmit={handleReplySubmit}
                  />

                  {isExpanded && remainingMotherComments.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {remainingMotherComments.map((motherComment) => (
                        <CommentItem
                          key={motherComment.id}
                          comment={motherComment}
                          postAuthorId={post.author.id}
                          postAuthorName={post.author.name}
                          isMother={true}
                          isCommentingDisabled={isCommentingDisabled}
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
                    placeholder="Write an answer or commute route guide..."
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
