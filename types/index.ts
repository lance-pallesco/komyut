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

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
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

export interface Post {
  id: string;
  author: User;
  title: string;
  origin: string;
  destination: string;
  body: string;
  region: Region;
  transportModes: TransportMode[];
  answerCount: number;
  upvoteCount: number;
  bookmarkCount?: number;
  userVoteState?: "up" | "down" | null;
  isBookmarked?: boolean;
  isCommentingDisabled?: boolean;
  isAnonymous?: boolean;
  status: PostStatus;
  createdAt: string;
  comments?: Comment[];
}

export interface TrendingRoute {
  id: string;
  origin: string;
  destination: string;
  questionCount: number;
  region: Region;
}

export interface TopContributor {
  id: string;
  user: User;
  rank: number;
}

export interface CommunityStat {
  label: string;
  value: string;
  changeText?: string;
}

export interface FilterState {
  tab: FeedTab;
  region: Region;
  searchQuery: string;
}
