import { prisma } from "@/lib/prisma";
import { MOCK_POSTS } from "@/lib/mock-data";
import type { Post, Comment } from "@/types";

export async function getFeedPosts(): Promise<Post[]> {
  try {
    const dbPosts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        tags: {
          include: { tag: true },
        },
        answers: {
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
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
      return MOCK_POSTS;
    }

    const formattedPosts: Post[] = dbPosts.map((p) => {
      const transportModes = p.tags.map((t) => t.tag.name as any);
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
        replies: ans.replies.map((rep) => ({
          id: rep.id,
          postId: rep.postId,
          parentId: rep.parentId || undefined,
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
        })),
      }));

      return {
        id: p.id,
        author: {
          id: p.author.id,
          name: p.author.name || p.author.username,
          username: p.author.username,
          avatarUrl: p.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          badge: p.author.role === "admin" ? "Community Guide" : "Route Master",
          reputationPoints: p.author.reputationPoints || 120,
          verifiedAnswersCount: p.author.verifiedAnswersCount || 0,
        },
        title: p.title,
        origin: p.origin,
        destination: p.destination,
        body: p.body,
        region: p.region as any,
        transportModes: transportModes.length > 0 ? transportModes : ["Jeepney", "Bus"],
        answerCount: p.answerCount || comments.length,
        upvoteCount: p.upvoteCount,
        userVoteState: null,
        isBookmarked: false,
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
