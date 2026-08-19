import { prisma } from "@/lib/prisma";
import type { ConfidenceTier } from "@/types";

/**
 * Compute the Box 4 confidence score for a candidate answer.
 * Formula:
 * raw = 0.4 * normalizedVotes + 0.2 * acceptedBonus + 0.2 * freshnessMultiplier - 0.3 * reportPenalty
 */
export async function computeConfidenceScore(answerId: string): Promise<number> {
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: { votes: true, reports: true },
  });

  if (!answer) return 0;

  // Hard exclusion: flagged spam or off-topic answers are NEVER surfaced
  if (answer.isSpam || answer.isOfftopic) {
    return 0;
  }

  const upvotes = answer.votes.filter((v) => v.direction === "up").length;
  const downvotes = answer.votes.filter((v) => v.direction === "down").length;
  const netVotes = Math.max(0, answer.upvoteCount || upvotes - downvotes);

  // 1. Normalized Votes: caps at 10 net votes = max score (Weight: 0.4)
  const normalizedVotes = Math.min(netVotes / 10, 1);

  // 2. Accepted / Verified answer bonus (Weight: 0.2)
  const acceptedBonus = answer.isVerified ? 1 : 0;

  // 3. Freshness: decays over 6 months since last confirmation (Weight: 0.2)
  const lastConfirmed = answer.lastConfirmedAt ? new Date(answer.lastConfirmedAt) : new Date(answer.createdAt);
  const monthsSinceConfirmed = Math.max(
    0,
    (Date.now() - lastConfirmed.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const freshnessMultiplier = 1 / (1 + monthsSinceConfirmed / 6);

  // 4. Open reports penalty (Weight: -0.3)
  const openReports = answer.reports.filter((r) => r.status === "pending").length;
  const reportPenalty = Math.min(openReports * 0.15, 0.6);

  // Calculate weighted total score
  const raw =
    0.4 * normalizedVotes +
    0.2 * acceptedBonus +
    0.2 * freshnessMultiplier -
    0.3 * reportPenalty;

  return Math.max(0, Math.min(1, raw));
}

/**
 * Assign confidence tier based on score.
 * - VERIFIED (>= 0.70): Community-confirmed answer
 * - LIKELY (>= 0.40): Matches previous answer, not yet heavily confirmed
 * - UNCONFIRMED (< 0.40): Someone answered a similar question, take with caution
 */
export function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 0.7) return "VERIFIED";
  if (score >= 0.4) return "LIKELY";
  return "UNCONFIRMED";
}

export interface ScoredAnswer {
  answer: any;
  confidence: number;
}

/**
 * Evaluates candidate answers on a matched post and selects the highest scoring answer.
 */
export async function pickBestAnswer(answers: any[]): Promise<ScoredAnswer | null> {
  if (!answers || answers.length === 0) return null;

  let bestAnswer: any = null;
  let bestConfidence = -1;

  for (const answer of answers) {
    const confidence = await computeConfidenceScore(answer.id);
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestAnswer = answer;
    }
  }

  // If all answers were spam/offtopic or scored 0, return null
  if (bestConfidence <= 0 || !bestAnswer) {
    return null;
  }

  return {
    answer: bestAnswer,
    confidence: bestConfidence,
  };
}
