import { prisma } from "@/lib/prisma";
import { upsertPostEmbedding, findMostSimilarPost } from "@/lib/embeddings";
import { pickBestAnswer, getConfidenceTier } from "@/lib/confidence";
import { enqueueJob } from "@/lib/qstash";

/**
 * Generate and store embedding for a newly created post.
 */
export async function embedPostTask(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      console.warn(`[AI Pipeline] Post not found for embedding: ${postId}`);
      return false;
    }

    // Structural formatting: origin + destination carry proper vector weight
    const textToEmbed = [
      `Route: From ${post.origin} to ${post.destination}`,
      `Title: ${post.title}`,
      post.body ? `Details: ${post.body}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await upsertPostEmbedding(postId, textToEmbed);

    await prisma.post.update({
      where: { id: postId },
      data: { processingStatus: "EMBEDDED" },
    });

    return true;
  } catch (err: any) {
    console.error(`[AI Pipeline] Failed to embed post ${postId}:`, err);
    await prisma.post.update({
      where: { id: postId },
      data: { processingStatus: "FAILED" },
    }).catch(() => { });
    return false;
  }
}

/**
 * 2-Stage Funnel & Confidence Scoring to generate tiered AISuggestion
 */
export async function generateSuggestionTask(postId: string) {
  try {
    const newPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!newPost) return null;

    const newPostAreaTagIds = newPost.tags
      .filter((pt) => pt.tag.type === "AREA")
      .map((pt) => pt.tagId);

    // Rule: AREA tags are always a hard filter. If new post has no area tags, no candidate matches.
    if (newPostAreaTagIds.length === 0) {
      return null;
    }

    const newPostTransportTagIds = newPost.tags
      .filter((pt) => pt.tag.type === "TRANSPORT")
      .map((pt) => pt.tagId);

    const hasTransportPreference = newPostTransportTagIds.length > 0;

    // Stage 1: Hard filter by AREA tags — candidates must share at least one AREA tag
    let candidates = await prisma.post.findMany({
      where: {
        id: { not: newPost.id },
        processingStatus: "EMBEDDED",
        tags: {
          some: { tagId: { in: newPostAreaTagIds } },
        },
      },
      include: {
        tags: { include: { tag: true } },
        answers: {
          include: {
            votes: true,
            reports: true,
            author: true,
          },
        },
      },
    });

    // If no candidate posts share the area tags, stop immediately (no suggestion)
    if (!candidates || candidates.length === 0) {
      return null;
    }

    // TRANSPORT tag check: hard filter only if user specified mode and matches exist
    let isCrossMode = false;
    if (hasTransportPreference) {
      const sameMode = candidates.filter((p) =>
        p.tags.some((t) => newPostTransportTagIds.includes(t.tagId))
      );
      if (sameMode.length > 0) {
        candidates = sameMode;
      } else {
        isCrossMode = true;
      }
    }

    // Post-to-Post Cosine Similarity via pgvector
    const candidatePostIds = candidates.map((p) => p.id);
    const bestMatch = await findMostSimilarPost(newPost.id, candidatePostIds);

    if (!bestMatch) {
      return null;
    }

    // Minimum cosine similarity threshold (default: 0.65)
    const minSimilarity = Number(process.env.AI_SIMILARITY_MIN || 0.65);
    if (bestMatch.similarity < minSimilarity) {
      return null;
    }

    const matchedPost = candidates.find((p) => p.id === bestMatch.postId);
    if (!matchedPost || !matchedPost.answers || matchedPost.answers.length === 0) {
      return null;
    }

    // Trust Check (Confidence Scoring on matched post's answers)
    const best = await pickBestAnswer(matchedPost.answers);
    if (!best || best.confidence <= 0) {
      return null;
    }

    // Create AISuggestion record
    const confidenceTier = getConfidenceTier(best.confidence);

    const suggestion = await prisma.aISuggestion.create({
      data: {
        postId: newPost.id,
        answerId: best.answer.id,
        confidenceScore: best.confidence,
        confidenceTier,
        similarityScore: bestMatch.similarity,
        isCrossMode,
      },
    });

    return suggestion;
  } catch (err) {
    console.error(`[AI Pipeline] Error generating suggestion for ${postId}:`, err);
    return null;
  }
}

/**
 * Full End-to-End Runner for post embedding + suggestion retrieval.
 * Dispatches via QStash if configured, otherwise executes asynchronously in-process.
 */
export async function runAIPipelineForPost(postId: string) {
  // 1. Try QStash queue first
  const queued = await enqueueJob("/api/jobs/embed-post", { postId });
  if (queued) {
    return;
  }

  // 2. Direct asynchronous execution
  (async () => {
    try {
      const embedded = await embedPostTask(postId);
      if (embedded) {
        await generateSuggestionTask(postId);
      }
    } catch (err) {
      console.error(`[AI Pipeline Worker] Background execution error for post ${postId}:`, err);
    }
  })().catch(() => { });
}
