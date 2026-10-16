export type Region =
  | "All Regions"
  | "Metro Manila"
  | "Cebu"
  | "Davao"
  | "Baguio"
  | "Pampanga"
  | "Laguna";

export type TransportMode =
  | "Jeepney"
  | "UV Express"
  | "Bus"
  | "MRT-3"
  | "LRT-1"
  | "LRT-2"
  | "Tricycle"
  | "Walk";

export type PostStatus = "verified" | "answered" | "unanswered" | "pinned";

export type FeedTab = "latest" | "trending" | "unanswered";

export type TagType = "AREA" | "TRANSPORT" | "CUSTOM";

export type ProcessingStatus = "PENDING" | "EMBEDDED" | "FAILED";

export type ConfidenceTier = "VERIFIED" | "LIKELY" | "UNCONFIRMED";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  type: TagType;
  usageCount: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  homeArea?: string;
  badge?: string;
  reputationPoints: number;
  verifiedAnswersCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  parentAuthorName?: string;
  author: User;
  body: string;
  createdAt: string;
  upvoteCount: number;
  isVerified?: boolean;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface AISuggestion {
  id: string;
  postId: string;
  answerId: string;
  answer?: Comment;
  confidenceScore: number;
  confidenceTier: ConfidenceTier;
  similarityScore: number;
  similarityThresholdUsed?: number;
  minConfidenceUsed?: number;
  isCrossMode: boolean;
  wasHelpful?: boolean | null;
  createdAt: string;
  sourcePostTitle?: string;
  sourcePostId?: string;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  origin: string;
  destination: string;
  body: string;
  region: Region;
  transportModes: TransportMode[];
  tags?: string[];
  answerCount: number;
  upvoteCount: number;
  bookmarkCount?: number;
  userVoteState?: "up" | "down" | null;
  isBookmarked?: boolean;
  isCommentingDisabled?: boolean;
  isAnonymous?: boolean;
  processingStatus?: ProcessingStatus;
  status: PostStatus;
  createdAt: string;
  comments?: Comment[];
  aiSuggestions?: AISuggestion[];
}

export interface TrendingRoute {
  id: string;
  origin: string;
  destination: string;
  questionCount: number;
  region: Region;
}

export interface UnansweredQuestion {
  id: string;
  title: string;
  origin: string;
  destination: string;
  region: Region;
  createdAt: string;
}

export interface TopContributor {
  id: string;
  user: User;
  rank: number;
}

export interface CommunityStat {
  id: string;
  label: string;
  value: string | number;
  change?: string;
}

export type NotificationType = "NEW_ANSWER" | "UPVOTE" | "ACCEPTED" | "MENTION";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actorId?: string | null;
  actor?: {
    id?: string;
    name: string;
    avatarUrl?: string;
    username?: string;
  } | null;
  referenceType?: "POST" | "ANSWER";
  referenceId?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
