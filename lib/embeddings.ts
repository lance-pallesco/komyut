import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

/**
 * Generate an embedding vector from text using the configured embedding model.
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  const model = process.env.OPENAI_EMBEDDING_MODEL || "openai/text-embedding-3-small";

  const response = await openai.embeddings.create({
    model,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Generate an embedding vector from text and upsert it into the embeddings table.
 * Strictly isolates all raw SQL for pgvector to this file.
 */
export async function upsertPostEmbedding(postId: string, text: string) {
  const model = process.env.OPENAI_EMBEDDING_MODEL || "openai/text-embedding-3-small";
  const vector = await generateTextEmbedding(text);
  const vectorString = `[${vector.join(",")}]`;

  await prisma.$executeRaw`
    INSERT INTO embeddings (id, "postId", embedding, model, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${postId}, ${vectorString}::vector, ${model}, NOW(), NOW())
    ON CONFLICT ("postId") DO UPDATE SET
      embedding = ${vectorString}::vector,
      model = ${model},
      "updatedAt" = NOW()
  `;
}

/**
 * Find the most similar post from a list of candidate post IDs.
 * Uses pgvector's <=> operator (cosine distance) — computed entirely in PostgreSQL.
 * Returns the best match with its cosine similarity score (1 - cosine distance).
 */
export async function findMostSimilarPost(
  sourcePostId: string,
  candidatePostIds: string[]
): Promise<{ postId: string; similarity: number } | null> {
  if (!candidatePostIds || candidatePostIds.length === 0) return null;

  try {
    const results = await prisma.$queryRaw<
      Array<{ postId: string; similarity: number | string }>
    >`
      SELECT
        candidate."postId" AS "postId",
        1 - (candidate.embedding <=> source.embedding) AS similarity
      FROM embeddings source
      JOIN embeddings candidate ON candidate."postId" = ANY(${candidatePostIds}::text[])
      WHERE source."postId" = ${sourcePostId}
        AND candidate."postId" != ${sourcePostId}
      ORDER BY candidate.embedding <=> source.embedding ASC
      LIMIT 1
    `;

    if (results.length === 0) return null;

    return {
      postId: results[0].postId,
      similarity: Number(results[0].similarity),
    };
  } catch (err: any) {
    console.error("[pgvector] Error executing cosine similarity query:", err);
    return null;
  }
}
