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
}

export async function getFeedPosts(options: GetFeedPostsOptions | string = {}): Promise<Post[]> {
  const opts: GetFeedPostsOptions =
    typeof options === "string" ? { userId: options } : options;

  const { userId, query, tagFilter, sort = "latest", region } = opts;

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
          where: { parentId: null },
          orderBy: [
            { isVerified: "desc" },
            { upvoteCount: "desc" },
            { createdAt: "desc" },
          ],
          include: {
            author: true,
            replies: {
              include: { author: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!dbPosts || dbPosts.length === 0) {
      // If user performed an active search query or tag filter, return empty array for 0 matches
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
      const comments: Comment[] = p.answers.map((ans) => ({
        id: ans.id,
        postId: ans.postId,
        parentId: ans.parentId || undefined,
        author: {
          id: ans.author.id,
          name: ans.author.name || ans.author.username,
          username: ans.author.username,
          avatarUrl: ans.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          reputationPoints: ans.author.reputationPoints || 100,
          verifiedAnswersCount: ans.author.verifiedAnswersCount || 0,
        },
        body: ans.body,
        createdAt: ans.createdAt.toISOString(),
        upvoteCount: ans.upvoteCount,
        isVerified: ans.isVerified,
        isLiked: votedAnswerIds.has(ans.id),
        replies: ans.replies.map((rep) => ({
          id: rep.id,
          postId: rep.postId,
          parentId: rep.parentId || undefined,
          parentAuthorName: ans.author.name || ans.author.username,
          author: {
            id: rep.author.id,
            name: rep.author.name || rep.author.username,
            username: rep.author.username,
            avatarUrl: rep.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            reputationPoints: rep.author.reputationPoints || 100,
            verifiedAnswersCount: rep.author.verifiedAnswersCount || 0,
          },
          body: rep.body,
          createdAt: rep.createdAt.toISOString(),
          upvoteCount: rep.upvoteCount,
          isVerified: rep.isVerified,
          isLiked: votedAnswerIds.has(rep.id),
        })),
      }));

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
        userVoteState: votedPostIds.has(p.id) ? "up" : null,
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
              where: { parentId: null },
              orderBy: [
                { isVerified: "desc" },
                { upvoteCount: "desc" },
                { createdAt: "desc" },
              ],
              include: {
                author: true,
                replies: {
                  include: { author: true },
                  orderBy: { createdAt: "asc" },
                },
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

      const comments: Comment[] = p.answers.map((ans) => ({
        id: ans.id,
        postId: ans.postId,
        parentId: ans.parentId || undefined,
        author: {
          id: ans.author.id,
          name: ans.author.name || ans.author.username,
          username: ans.author.username,
          avatarUrl: ans.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          reputationPoints: ans.author.reputationPoints || 100,
          verifiedAnswersCount: ans.author.verifiedAnswersCount || 0,
        },
        body: ans.body,
        createdAt: ans.createdAt.toISOString(),
        upvoteCount: ans.upvoteCount,
        isVerified: ans.isVerified,
        isLiked: votedAnswerIds.has(ans.id),
        replies: ans.replies.map((rep) => ({
          id: rep.id,
          postId: rep.postId,
          parentId: rep.parentId || undefined,
          parentAuthorName: ans.author.name || ans.author.username,
          author: {
            id: rep.author.id,
            name: rep.author.name || rep.author.username,
            username: rep.author.username,
            avatarUrl: rep.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            reputationPoints: rep.author.reputationPoints || 100,
            verifiedAnswersCount: rep.author.verifiedAnswersCount || 0,
          },
          body: rep.body,
          createdAt: rep.createdAt.toISOString(),
          upvoteCount: rep.upvoteCount,
          isVerified: rep.isVerified,
          isLiked: votedAnswerIds.has(rep.id),
        })),
      }));

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
          where: { parentId: null },
          orderBy: [
            { isVerified: "desc" },
            { upvoteCount: "desc" },
            { createdAt: "desc" },
          ],
          include: {
            author: true,
            replies: {
              include: { author: true },
              orderBy: { createdAt: "asc" },
            },
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

      const comments: Comment[] = p.answers.map((ans) => ({
        id: ans.id,
        postId: ans.postId,
        parentId: ans.parentId || undefined,
        author: {
          id: ans.author.id,
          name: ans.author.name || ans.author.username,
          username: ans.author.username,
          avatarUrl: ans.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          reputationPoints: ans.author.reputationPoints || 100,
          verifiedAnswersCount: ans.author.verifiedAnswersCount || 0,
        },
        body: ans.body,
        createdAt: ans.createdAt.toISOString(),
        upvoteCount: ans.upvoteCount,
        isVerified: ans.isVerified,
        isLiked: votedAnswerIds.has(ans.id),
        replies: ans.replies.map((rep) => ({
          id: rep.id,
          postId: rep.postId,
          parentId: rep.parentId || undefined,
          parentAuthorName: ans.author.name || ans.author.username,
          author: {
            id: rep.author.id,
            name: rep.author.name || rep.author.username,
            username: rep.author.username,
            avatarUrl: rep.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            reputationPoints: rep.author.reputationPoints || 100,
            verifiedAnswersCount: rep.author.verifiedAnswersCount || 0,
          },
          body: rep.body,
          createdAt: rep.createdAt.toISOString(),
          upvoteCount: rep.upvoteCount,
          isVerified: rep.isVerified,
          isLiked: votedAnswerIds.has(rep.id),
        })),
      }));

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
