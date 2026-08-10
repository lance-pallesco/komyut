import { prisma } from "@/lib/prisma";
import { MOCK_POSTS } from "@/lib/mock-data";
import { resolveTagByKeyword } from "@/lib/tag-service";
import type { Post, Comment } from "@/types";

export interface GetFeedPostsOptions {
  userId?: string;
  query?: string;
  tagFilter?: string;
  sort?: "relevant" | "latest" | "most_voted" | "unanswered";
  region?: string;
  postId?: string;
}

function buildCommentTree(allAnswers: any[], votedAnswerIds: Set<string>): Comment[] {
  const authorMap = new Map<string, string>();
  for (const ans of allAnswers) {
    authorMap.set(ans.id, ans.author.name || ans.author.username);
  }

  const mapAnswerToComment = (ans: any, explicitParentAuthorName?: string): Comment => {
    let pName = explicitParentAuthorName;
    if (pName === "undefined" || pName === "null") {
      pName = undefined;
    }

    return {
      id: ans.id,
      postId: ans.postId,
      parentId: ans.parentId || undefined,
      parentAuthorName: pName,
      author: {
        id: ans.author.id,
        name: ans.author.name || ans.author.username,
        username: ans.author.username,
        avatarUrl: ans.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        coverUrl: ans.author.coverUrl || undefined,
        homeArea: ans.author.homeArea || undefined,
        reputationPoints: ans.author.reputationPoints || 100,
        verifiedAnswersCount: ans.author.verifiedAnswersCount || 0,
      },
      body: (ans.body || "").replace(/@undefined\s*/gi, "").replace(/@null\s*/gi, "").trim(),
      createdAt: ans.createdAt.toISOString(),
      upvoteCount: ans.upvoteCount,
      isVerified: ans.isVerified,
      isLiked: votedAnswerIds.has(ans.id),
      replies: [],
    };
  };

  // Level 1: Mother comments (parentId == null)
  const motherAnswers = allAnswers.filter((ans) => !ans.parentId);
  motherAnswers.sort((a, b) => {
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    if (a.upvoteCount !== b.upvoteCount) return b.upvoteCount - a.upvoteCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Only answers that have a parentId are candidates for Level 2 & Level 3
  const childAnswers = allAnswers.filter((ans) => !!ans.parentId);

  return motherAnswers.map((motherAns) => {
    const motherComment = mapAnswerToComment(motherAns);

    // Level 2: Direct replies to this Mother Comment
    const level2Answers = childAnswers.filter((ans) => ans.parentId === motherAns.id);
    level2Answers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    motherComment.replies = level2Answers.map((l2Ans) => {
      const mName = motherAns.author.name || motherAns.author.username;
      const escapedMName = mName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const hasL2Mention = (l2Ans.body || "").startsWith("@") || new RegExp(`^@${escapedMName}\\b`, "i").test(l2Ans.body || "");
      const l2ParentAuthorName = hasL2Mention ? mName : undefined;

      const l2Comment = mapAnswerToComment(l2Ans, l2ParentAuthorName);

      // Level 3: Replies to this Level 2 comment
      const level3Answers = childAnswers.filter((ans) => ans.parentId === l2Ans.id);
      level3Answers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      l2Comment.replies = level3Answers.map((l3Ans) => {
        const rawParentName = l3Ans.parentId ? authorMap.get(l3Ans.parentId) : l2Ans.author.name;
        let l3ParentAuthorName: string | undefined = undefined;
        if (rawParentName) {
          const escapedPName = rawParentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const hasL3Mention = (l3Ans.body || "").startsWith("@") || new RegExp(`^@${escapedPName}\\b`, "i").test(l3Ans.body || "");
          l3ParentAuthorName = hasL3Mention ? rawParentName : undefined;
        }
        return mapAnswerToComment(l3Ans, l3ParentAuthorName);
      });

      return l2Comment;
    });

    return motherComment;
  });
}

export async function getFeedPosts(options: GetFeedPostsOptions | string = {}): Promise<Post[]> {
  const opts: GetFeedPostsOptions =
    typeof options === "string" ? { userId: options } : options;

  const { userId, query, tagFilter, sort = "latest", region, postId } = opts;

  try {
    const userVotes = userId
      ? await prisma.vote.findMany({ where: { userId } })
      : [];
    const userBookmarks = userId
      ? await prisma.bookmark.findMany({ where: { userId } })
      : [];

    const votedPostIds = new Set(
      userVotes.filter((v) => v.postId).map((v) => v.postId!)
    );
    const votedAnswerIds = new Set(
      userVotes.filter((v) => v.answerId).map((v) => v.answerId!)
    );
    const bookmarkedPostIds = new Set(
      userBookmarks.map((b) => b.postId)
    );

    // Build Prisma `where` clause dynamically
    const whereClause: any = {};

    // 1. Region Filter
    if (region && region !== "All Regions") {
      whereClause.region = { equals: region, mode: "insensitive" };
    }

    // 2. Tag Filter (Canonical & Aliases)
    if (tagFilter && tagFilter.trim()) {
      const cleanTag = tagFilter.trim();
      const canonicalTag = await resolveTagByKeyword(cleanTag);
      const targetTagName = canonicalTag ? canonicalTag.name : cleanTag;

      whereClause.tags = {
        some: {
          tag: {
            OR: [
              { name: { equals: targetTagName, mode: "insensitive" } },
              { slug: { equals: cleanTag.toLowerCase() } },
              { aliases: { has: cleanTag } },
            ],
          },
        },
      };
    }

    // 3. Keyword Search across Title, Body, Origin, Destination & Answers.body
    if (query && query.trim()) {
      const q = query.trim();
      const canonicalTag = await resolveTagByKeyword(q);

      const searchConditions: any[] = [
        { title: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        { origin: { contains: q, mode: "insensitive" } },
        { destination: { contains: q, mode: "insensitive" } },
        { answers: { some: { body: { contains: q, mode: "insensitive" } } } },
      ];

      if (canonicalTag) {
        searchConditions.push({
          tags: {
            some: {
              tagId: canonicalTag.id,
            },
          },
        });
      }

      whereClause.OR = searchConditions;
    }

    // 4. Sorting Options
    let orderByClause: any = { createdAt: "desc" };
    if (sort === "most_voted") {
      orderByClause = [{ upvoteCount: "desc" }, { createdAt: "desc" }];
    } else if (sort === "relevant" && query) {
      orderByClause = [{ answerCount: "desc" }, { upvoteCount: "desc" }, { createdAt: "desc" }];
    } else if (sort === "unanswered") {
      whereClause.answerCount = { lt: 1 };
      orderByClause = [{ createdAt: "desc" }];
    }

    const dbPosts = await prisma.post.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        author: true,
        tags: {
          include: { tag: true },
        },
        answers: {
          orderBy: { createdAt: "asc" },
          include: {
            author: true,
          },
        },
      },
    });

    if (!dbPosts || dbPosts.length === 0) {
      if ((query && query.trim()) || (tagFilter && tagFilter.trim())) {
        return [];
      }
      return MOCK_POSTS;
    }

    const formattedPosts: Post[] = dbPosts.map((p) => {
      const transportModes = p.tags
        .filter((t) => t.tag.type === "TRANSPORT" || !t.tag.type)
        .map((t) => t.tag.name as any);
      const customAndAreaTags = p.tags
        .filter((t) => t.tag.type === "AREA" || t.tag.type === "CUSTOM")
        .map((t) => t.tag.name);

      const comments: Comment[] = buildCommentTree(p.answers, votedAnswerIds);

      const authorObj = p.isAnonymous
        ? {
            id: p.author.id,
            name: "Anonymous Commuter",
            username: "anonymous",
            avatarUrl: undefined,
            badge: "Anonymous Commuter",
            reputationPoints: 0,
            verifiedAnswersCount: 0,
          }
        : {
            id: p.author.id,
            name: p.author.name || p.author.username,
            username: p.author.username,
            avatarUrl: p.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            coverUrl: p.author.coverUrl || undefined,
            homeArea: p.author.homeArea || undefined,
            badge: p.author.role === "admin" ? "Community Guide" : "Route Master",
            reputationPoints: p.author.reputationPoints || 120,
            verifiedAnswersCount: p.author.verifiedAnswersCount || 0,
          };

      return {
        id: p.id,
        author: authorObj,
        title: p.title,
        origin: p.origin,
        destination: p.destination,
        body: p.body,
        region: p.region as any,
        transportModes: transportModes.length > 0 ? transportModes : ["Jeepney", "Bus"],
        tags: customAndAreaTags,
        answerCount: p.answerCount || comments.length,
        upvoteCount: p.upvoteCount,
        userVoteState: votedPostIds.has(p.id) ? "up" : null,
        isBookmarked: bookmarkedPostIds.has(p.id),
        isCommentingDisabled: p.isCommentingDisabled || false,
        isAnonymous: p.isAnonymous || false,
        status: p.status as any,
        createdAt: p.createdAt.toISOString(),
        comments,
      };
    });

    if (postId) {
      const targetIndex = formattedPosts.findIndex((p) => p.id === postId);
      if (targetIndex > 0) {
        const [targetPost] = formattedPosts.splice(targetIndex, 1);
        formattedPosts.unshift(targetPost);
      } else if (targetIndex === -1) {
        // If not found in default feed query, fetch it directly and prepended to top
        const targetPost = await getPostById(postId, userId);
        if (targetPost) {
          formattedPosts.unshift(targetPost);
        }
      }
    }

    return formattedPosts;
  } catch (error) {
    console.error("Error fetching feed posts from database:", error);
    return MOCK_POSTS;
  }
}

export async function getSavedPosts(userId: string): Promise<Post[]> {
  if (!userId) return [];

  try {
    const userVotes = await prisma.vote.findMany({ where: { userId } });
    const votedAnswerIds = new Set(
      userVotes.filter((v) => v.answerId).map((v) => v.answerId!)
    );

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: true,
            tags: {
              include: { tag: true },
            },
            answers: {
              orderBy: { createdAt: "asc" },
              include: {
                author: true,
              },
            },
          },
        },
      },
    });

    if (!bookmarks || bookmarks.length === 0) {
      return [];
    }

    const savedPosts: Post[] = bookmarks.map((b) => {
      const p = b.post;
      const transportModes = p.tags
        .filter((t) => t.tag.type === "TRANSPORT" || !t.tag.type)
        .map((t) => t.tag.name as any);
      const customAndAreaTags = p.tags
        .filter((t) => t.tag.type === "AREA" || t.tag.type === "CUSTOM")
        .map((t) => t.tag.name);

      const comments: Comment[] = buildCommentTree(p.answers, votedAnswerIds);

      const authorObj = p.isAnonymous
        ? {
            id: p.author.id,
            name: "Anonymous Commuter",
            username: "anonymous",
            avatarUrl: undefined,
            badge: "Anonymous Commuter",
            reputationPoints: 0,
            verifiedAnswersCount: 0,
          }
        : {
            id: p.author.id,
            name: p.author.name || p.author.username,
            username: p.author.username,
            avatarUrl: p.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            badge: p.author.role === "admin" ? "Community Guide" : "Route Master",
            reputationPoints: p.author.reputationPoints || 120,
            verifiedAnswersCount: p.author.verifiedAnswersCount || 0,
          };

      return {
        id: p.id,
        author: authorObj,
        title: p.title,
        origin: p.origin,
        destination: p.destination,
        body: p.body,
        region: p.region as any,
        transportModes: transportModes.length > 0 ? transportModes : ["Jeepney", "Bus"],
        tags: customAndAreaTags,
        answerCount: p.answerCount || comments.length,
        upvoteCount: p.upvoteCount,
        userVoteState: null,
        isBookmarked: true,
        isCommentingDisabled: p.isCommentingDisabled || false,
        isAnonymous: p.isAnonymous || false,
        status: p.status as any,
        createdAt: p.createdAt.toISOString(),
        comments,
      };
    });

    return savedPosts;
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return [];
  }
}

export async function getUserQuestions(userId: string): Promise<Post[]> {
  if (!userId) return [];

  try {
    const userVotes = await prisma.vote.findMany({ where: { userId } });
    const userBookmarks = await prisma.bookmark.findMany({ where: { userId } });

    const votedAnswerIds = new Set(
      userVotes.filter((v) => v.answerId).map((v) => v.answerId!)
    );
    const bookmarkedPostIds = new Set(userBookmarks.map((b) => b.postId));

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        tags: {
          include: { tag: true },
        },
        answers: {
          orderBy: { createdAt: "asc" },
          include: {
            author: true,
          },
        },
      },
    });

    if (!posts || posts.length === 0) {
      return [];
    }

    const formattedPosts: Post[] = posts.map((p) => {
      const transportModes = p.tags
        .filter((t) => t.tag.type === "TRANSPORT" || !t.tag.type)
        .map((t) => t.tag.name as any);
      const customAndAreaTags = p.tags
        .filter((t) => t.tag.type === "AREA" || t.tag.type === "CUSTOM")
        .map((t) => t.tag.name);

      const comments: Comment[] = buildCommentTree(p.answers, votedAnswerIds);

      const authorObj = p.isAnonymous
        ? {
            id: p.author.id,
            name: "Anonymous Commuter",
            username: "anonymous",
            avatarUrl: undefined,
            badge: "Anonymous Commuter",
            reputationPoints: 0,
            verifiedAnswersCount: 0,
          }
        : {
            id: p.author.id,
            name: p.author.name || p.author.username,
            username: p.author.username,
            avatarUrl: p.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            badge: p.author.role === "admin" ? "Community Guide" : "Route Master",
            reputationPoints: p.author.reputationPoints || 120,
            verifiedAnswersCount: p.author.verifiedAnswersCount || 0,
          };

      return {
        id: p.id,
        author: authorObj,
        title: p.title,
        origin: p.origin,
        destination: p.destination,
        body: p.body,
        region: p.region as any,
        transportModes: transportModes.length > 0 ? transportModes : ["Jeepney", "Bus"],
        tags: customAndAreaTags,
        answerCount: p.answerCount || comments.length,
        upvoteCount: p.upvoteCount,
        userVoteState: null,
        isBookmarked: bookmarkedPostIds.has(p.id),
        isCommentingDisabled: p.isCommentingDisabled || false,
        isAnonymous: p.isAnonymous || false,
        status: p.status as any,
        createdAt: p.createdAt.toISOString(),
        comments,
      };
    });

    return formattedPosts;
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return [];
  }
}

export async function getPostById(postId: string, userId?: string): Promise<Post | null> {
  if (!postId) return null;

  try {
    const single = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        tags: { include: { tag: true } },
        answers: {
          orderBy: { createdAt: "asc" },
          include: {
            author: true,
          },
        },
      },
    });

    if (!single) return null;

    const userVotes = userId ? await prisma.vote.findMany({ where: { userId } }) : [];
    const userBookmarks = userId ? await prisma.bookmark.findMany({ where: { userId } }) : [];
    const votedPostIds = new Set(userVotes.filter((v) => v.postId).map((v) => v.postId!));
    const votedAnswerIds = new Set(userVotes.filter((v) => v.answerId).map((v) => v.answerId!));
    const bookmarkedPostIds = new Set(userBookmarks.map((b) => b.postId));

    const transportModes = single.tags
      .filter((t) => t.tag.type === "TRANSPORT" || !t.tag.type)
      .map((t) => t.tag.name as any);
    const customAndAreaTags = single.tags
      .filter((t) => t.tag.type === "AREA" || t.tag.type === "CUSTOM")
      .map((t) => t.tag.name);

    const comments: Comment[] = buildCommentTree(single.answers, votedAnswerIds);

    return {
      id: single.id,
      author: single.isAnonymous
        ? {
            id: single.author.id,
            name: "Anonymous Commuter",
            username: "anonymous",
            avatarUrl: undefined,
            badge: "Anonymous Commuter",
            reputationPoints: 0,
            verifiedAnswersCount: 0,
          }
        : {
            id: single.author.id,
            name: single.author.name || single.author.username,
            username: single.author.username,
            avatarUrl: single.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            coverUrl: single.author.coverUrl || undefined,
            homeArea: single.author.homeArea || undefined,
            badge: single.author.role === "admin" ? "Community Guide" : "Route Master",
            reputationPoints: single.author.reputationPoints || 120,
            verifiedAnswersCount: single.author.verifiedAnswersCount || 0,
          },
      title: single.title,
      origin: single.origin,
      destination: single.destination,
      body: single.body,
      region: single.region as any,
      transportModes: transportModes.length > 0 ? transportModes : ["Jeepney", "Bus"],
      tags: customAndAreaTags,
      answerCount: single.answerCount || comments.length,
      upvoteCount: single.upvoteCount,
      userVoteState: votedPostIds.has(single.id) ? "up" : null,
      isBookmarked: bookmarkedPostIds.has(single.id),
      isCommentingDisabled: single.isCommentingDisabled || false,
      isAnonymous: single.isAnonymous || false,
      status: single.status as any,
      createdAt: single.createdAt.toISOString(),
      comments,
    };
  } catch (err) {
    console.error("Error in getPostById:", err);
    return null;
  }
}
