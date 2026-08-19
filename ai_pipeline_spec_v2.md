# AI Pipeline — Implementation Spec (Build-Ready)

> Canonical, consolidated version. Supersedes all prior AI pipeline drafts. This is the document to build against.

---

## 0. Governing Principle

> **Community is the source of truth. AI retrieves, never generates.**
>
> Every gate in this pipeline exists to answer one of two questions: *"Is this relevant?"* or *"Is this trustworthy?"* — never *"What should the answer be?"*
>
> The AI never writes a route. It only ever surfaces a route someone in the community already wrote and the community has had a chance to vet.

---

## 1. Schema Changes — Diff Against Current Schema

> [!IMPORTANT]
> This section shows **only what changes or gets added** relative to the existing schema at schema.prisma. Existing fields not listed here stay as-is.

### 1.1 `Post` — Add fields

```prisma
model Post {
  // ...existing fields (id, userId, title, body, originText, destinationText, etc.)...

  // NEW: AI pipeline fields
  processingStatus   ProcessingStatus   @default(PENDING)

  // NEW: Relations
  embedding          Embedding?
  aiSuggestions      AISuggestion[]
}
```

**Why `processingStatus`?** Tracks whether the post's embedding has been generated. The UI can show a subtle indicator or simply hide the "AI Note" section until status is `EMBEDDED`.

---

### 1.2 `Answer` — Add fields

```prisma
model Answer {
  // ...existing fields (id, postId, userId, body, upvoteCount, downvoteCount, isAccepted, etc.)...

  // NEW: AI pipeline fields
  processingStatus         ProcessingStatus @default(PENDING)
  lastConfirmedAt          DateTime         @default(now())   // updated by "Still accurate?" taps
  isSpam                   Boolean          @default(false)
  isOfftopic               Boolean          @default(false)
  isLowEffort              Boolean          @default(false)
  classificationConfidence Float?                             // classifier's own confidence, for tuning review

  // NEW: Relations
  embedding                Embedding?
}
```

**Why `lastConfirmedAt`?** The confidence scoring formula (Box 4) uses freshness decay. When a community member taps "Nasubukan ko rin!" (confirmed working) or upvotes, this timestamp resets — so actively-confirmed routes don't suffer artificial decay.

**Why `isSpam` / `isOfftopic` / `isLowEffort`?** Hard exclusion flags for Box 4. An answer flagged as spam is never surfaced as an AI suggestion, regardless of how many votes it has.

**Why `classificationConfidence`?** When the content classifier flags an answer, it logs its own confidence. This lets you audit edge cases later — if the classifier was only 55% confident something was spam, you might want to review that differently than 98%.

---

### 1.3 `Embedding` — New model

```prisma
model Embedding {
  id         String   @id @default(uuid())
  postId     String?  @unique
  answerId   String?  @unique              // reserved for future answer-level re-rank — not used in v1
  post       Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  answer     Answer?  @relation(fields: [answerId], references: [id], onDelete: Cascade)
  embedding  Unsupported("vector(1536)")   // native pgvector column — NOT a JSON string
  model      String   @default("text-embedding-3-small")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("embeddings")
}
```

**Why native `vector(1536)` instead of a JSON string?**

Using pgvector from day 1 avoids a future data migration on a live production database. The tradeoff is that Prisma can't read/write `Unsupported` columns with normal ORM methods — all vector inserts and queries must use `prisma.$executeRaw` and `prisma.$queryRaw`. To keep the codebase clean, **all raw SQL is isolated to a single file: `lib/embeddings.ts`**. The rest of the codebase (98%) uses normal Prisma.

**Why `model` field?** If you later switch from `text-embedding-3-small` to a different model, old embeddings become incompatible. This field tracks which model generated each vector, so a migration script knows which rows to re-embed.

> [!IMPORTANT]
> **Clean separation rule**: Only `lib/embeddings.ts` touches raw SQL. Every other file in the codebase interacts with embeddings through exported functions from that file — never through direct `$executeRaw` / `$queryRaw` calls.

---

### 1.4 `AISuggestion` — New model (replaces old schema)

```prisma
model AISuggestion {
  id                      String          @id @default(uuid())
  postId                  String
  post                    Post            @relation(fields: [postId], references: [id], onDelete: Cascade)
  answerId                String          // FK to the specific answer being suggested
  answer                  Answer          @relation(fields: [answerId], references: [id])
  confidenceScore         Float           @default(0.0)
  confidenceTier          ConfidenceTier  // VERIFIED | LIKELY | UNCONFIRMED
  similarityScore         Float           // raw cosine similarity that triggered this
  similarityThresholdUsed Float?          // what threshold was active at creation time (for audit)
  minConfidenceUsed       Float?          // what confidence cutoff was active (for audit)
  isCrossMode             Boolean         @default(false)  // true = fallback to different transport mode
  wasHelpful              Boolean?        // null = no feedback, true/false = user rated
  createdAt               DateTime        @default(now())

  @@map("ai_suggestions")
}
```

**Why log `similarityThresholdUsed` and `minConfidenceUsed`?** When you're tuning thresholds later based on `wasHelpful` feedback, you need to know what config values were active when each past suggestion was created. Otherwise you can't distinguish "bad model decision" from "outdated config value."

**Why `answerId` (single FK) instead of `sourceAnswerIds` (array)?** Each `AISuggestion` record maps to exactly one suggested answer. If multiple answers from a matched post are worth surfacing, create multiple `AISuggestion` rows — this keeps the schema relational and queryable.

---

### 1.5 New Enums

```prisma
enum ProcessingStatus {
  PENDING
  EMBEDDED
  FAILED
}

enum ConfidenceTier {
  VERIFIED
  LIKELY
  UNCONFIRMED
}
```

---

### 1.6 pgvector Setup

pgvector is used from day 1. Both your local PostgreSQL and Supabase must have the extension enabled.

#### Initial Prisma Migration

Run `npx prisma migrate dev --create-only` to generate a blank migration file, then add:

```sql
-- prisma/migrations/YYYYMMDD_init_pgvector/migration.sql
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW index for fast cosine similarity search
-- Created immediately — no future migration needed
CREATE INDEX IF NOT EXISTS embeddings_vector_hnsw_idx
  ON embeddings USING hnsw (embedding vector_cosine_ops);
```

Then run `npx prisma migrate dev` to apply.

#### Supabase (Production)

pgvector is **pre-installed** on Supabase. No additional setup needed — `CREATE EXTENSION IF NOT EXISTS vector;` works immediately.

#### Environment

```env
# Local development
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/komyut"

# Production (Supabase) — only the connection string changes, code is identical
# DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"
```

Same Prisma schema, same raw SQL queries, same `<=>` operator. **Zero code differences between environments.**

---

## 2. Box 1 — Post Created (Synchronous)

**What happens, in order, all before the user sees their post:**

1. Post saved via Prisma (`originText`, `destinationText`)
2. Auto-tagging runs. (Already working and implemented.)
3. Response returned to the user. Total wait: **~2-4 seconds**, acceptable for a deliberate "post" action, comparable to other platforms processing a post before it appears.
4. **After** the response is sent: `enqueueJob("/api/jobs/embed-post", { postId })` — this is the only part that's actually asynchronous. Everything the user sees is already complete by this point.

```ts
// app/actions/post-actions.ts
import { enqueueJob } from "@/lib/qstash";

export async function createPostAction(data: PostInput) {
  // Step 1: Save post
  const post = await prisma.post.create({
    data: { ...data, processingStatus: "PENDING" },
  });

  // Step 2: Auto-tag (synchronous, with timeout fallback)
  const tags = await generateAutoTagsAction(post);
  await attachTags(post.id, tags);

  // Step 3: Return to user (post + tags visible immediately)
  // Step 4: Fire background embedding job (async, via QStash)
  await enqueueJob("/api/jobs/embed-post", { postId: post.id });

  return post;
}
```

---

## 3. Background Job Architecture — QStash

### Why Not `after()` or Fire-and-Forget?

Next.js Server Actions on Vercel run inside ephemeral serverless functions. Once a Server Action returns its response, the function can be **frozen or terminated at any point**. Calling `generateEmbedding()` without awaiting it inside a Server Action does not guarantee completion — it can silently die mid-request with no error surfaced anywhere.

**QStash** solves this by moving AI work into **separate HTTP requests** entirely. Server Actions only publish a job URL; QStash delivers it via HTTP POST with **automatic retries and backoff** on failure.

### Setup

```bash
npm install @upstash/qstash
```

```env
# .env
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
APP_URL=https://your-app.vercel.app   # or ngrok URL for local dev
```

### QStash Wrapper

```ts
// lib/qstash.ts
import { Client } from "@upstash/qstash";

export const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function enqueueJob(endpointPath: string, payload: object) {
  await qstash.publishJSON({
    url: `${process.env.APP_URL}${endpointPath}`,
    body: payload,
  });
}
```

Every other file calls `enqueueJob("/api/jobs/embed-post", { postId })` — nobody outside `lib/qstash.ts` needs to know the queue implementation.

### Job Routes

| Route | Trigger | Purpose |
|-------|---------|---------|
| `/api/jobs/embed-post` | Box 1 completes | Generate + store post embedding |
| `/api/jobs/embed-answer` | Answer created | Generate + store answer embedding (future) |
| `/api/jobs/generate-suggestion` | Post embedded | Run 2-stage funnel + create AI suggestion |

All routes wrapped with `verifySignatureAppRouter` to prevent unauthorized calls.

---

## 4. Box 2 — Embedding Job (Background, via QStash)

Triggered by QStash delivering an HTTP POST to `/api/jobs/embed-post` — a **separate request**, disconnected from the user who posted.

```ts
// app/api/jobs/embed-post/route.ts
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { enqueueJob } from "@/lib/qstash";
import { upsertPostEmbedding } from "@/lib/embeddings";

async function handler(req: Request) {
  const { postId } = await req.json();

  try {
    const post = await prisma.post.findUniqueOrThrow({
      where: { id: postId },
    });

    // Structural formatting: origin + destination carry proper vector weight
    const textToEmbed = [
      `Route: From ${post.originText} to ${post.destinationText}`,
      `Title: ${post.title}`,
      post.body ? `Details: ${post.body}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // All raw SQL lives in lib/embeddings.ts — this file never touches $executeRaw
    await upsertPostEmbedding(postId, textToEmbed);

    await prisma.post.update({
      where: { id: postId },
      data: { processingStatus: "EMBEDDED" },
    });

    // Hand off to Box 3
    await enqueueJob("/api/jobs/generate-suggestion", { postId });

    return Response.json({ ok: true });
  } catch (err) {
    await prisma.post.update({
      where: { id: postId },
      data: { processingStatus: "FAILED" },
    });
    return new Response("Failed", { status: 500 }); // QStash retries on non-2xx
  }
}

export const POST = verifySignatureAppRouter(handler);
```

> [!IMPORTANT]
> **Embedding input format matters.** The structured prefix `"Route: From [origin] to [destination]"` ensures the embedding model weights geographic endpoints strongly, not just the conversational phrasing of the title. This directly improves Stage 2 ranking accuracy.

---

## 5. Box 3 — Similarity Search (Two-Stage Funnel)

Triggered by the `generate-suggestion` job, published at the end of Box 2.

### Overview

```
┌──────────────────────────────────────────────────────────────┐
│  STAGE 1: Tag Pre-Filter (PostgreSQL indexed join)           │
│  "Only posts sharing AREA tag(s) with the new post"          │
│  Eliminates 90-95% of database. Cost: <2ms.                 │
├──────────────────────────────────────────────────────────────┤
│  STAGE 2: Post-to-Post Cosine Similarity (pgvector <=>)      │
│  "Rank remaining candidates by semantic similarity"          │
│  Origin + destination already baked into embedding via       │
│  structured prefix. Ranker, not a gate. Best match → Box 4. │
└──────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> **Why no coordinate proximity stage?** Filipino commuters navigate by landmarks (*"kanto sa may Jollibee"*, *"terminal sa likod ng Mercury Drug"*), not street addresses. Geocoding APIs can't resolve these — they'd return garbage coordinates or fail silently. Wrong coordinates are **worse than no coordinates**, because they'd confidently exclude genuinely relevant candidates based on bad data.
>
> The structured embedding prefix `"Route: From [origin] to [destination]"` already captures origin/destination semantics. A post embedding for *"SM Fairview → BGC"* is a very different vector from *"Cubao → BGC"* — Stage 2 naturally distinguishes them without needing lat/lng.
>
> **Future option**: If real usage reveals cases where embeddings alone can't distinguish nearby-but-different locations, add an optional Google Maps location picker at post creation time to collect clean coordinates from the user directly.

---

### Stage 1 — Tag Pre-Filter

```ts
// Fetch the new post with its tags
const newPost = await prisma.post.findUniqueOrThrow({
  where: { id: postId },
  include: {
    tags: { include: { tag: true } },
  },
});

const newPostAreaTagIds = newPost.tags
  .filter((pt) => pt.tag.type === "AREA")
  .map((pt) => pt.tagId);

const newPostTransportTagIds = newPost.tags
  .filter((pt) => pt.tag.type === "TRANSPORT")
  .map((pt) => pt.tagId);

const hasTransportPreference = newPostTransportTagIds.length > 0;

// Stage 1: Hard filter by AREA tags — returns post IDs only
let candidates = await prisma.post.findMany({
  where: {
    id: { not: newPost.id },
    processingStatus: "EMBEDDED",
    tags: {
      some: { tagId: { in: newPostAreaTagIds } },  // AREA — always hard
    },
  },
  include: {
    tags: { include: { tag: true } },
    answers: { include: { votes: true, reports: true } },
  },
});

// TRANSPORT tag: hard filter only if the asker specified a mode
let isCrossMode = false;
if (hasTransportPreference) {
  const sameMode = candidates.filter((p) =>
    p.tags.some((t) => newPostTransportTagIds.includes(t.tagId))
  );
  if (sameMode.length > 0) {
    candidates = sameMode;
  } else {
    isCrossMode = true;
    // No matching mode — proceed with all area-filtered candidates,
    // but flag the eventual suggestion as cross-mode
  }
}
```

**Rules:**
- **AREA tags**: Always a hard filter. No exceptions. A post tagged `Quezon City` never matches a post tagged `Makati`.
- **TRANSPORT tags**: Hard filter *only if the asker specified a mode*. If they didn't mention transport, any correct route is useful. If they specified "jeepney" but no jeepney-route candidates exist, proceed with all candidates but set `isCrossMode = true` for honest labeling.

---

### Stage 2 — Post-to-Post Cosine Similarity via pgvector (Ranks What's Left)

All vector operations happen inside `lib/embeddings.ts` — the single file that touches raw SQL.

```ts
// lib/embeddings.ts — THE ONLY FILE WITH RAW SQL
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

/**
 * Generate an embedding vector from text and upsert it into the embeddings table.
 * Used by Box 2 (embed-post job) and future embed-answer job.
 */
export async function upsertPostEmbedding(postId: string, text: string) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  const vector = res.data[0].embedding;
  const vectorString = `[${vector.join(",")}]`;

  await prisma.$executeRaw`
    INSERT INTO embeddings (id, post_id, embedding, model, created_at, updated_at)
    VALUES (gen_random_uuid(), ${postId}, ${vectorString}::vector, 'text-embedding-3-small', NOW(), NOW())
    ON CONFLICT (post_id) DO UPDATE SET
      embedding = ${vectorString}::vector,
      updated_at = NOW()
  `;
}

/**
 * Find the most similar post from a list of candidate post IDs.
 * Uses pgvector's <=> operator (cosine distance) — computed entirely in PostgreSQL.
 * Returns the best match with its similarity score.
 */
export async function findMostSimilarPost(
  sourcePostId: string,
  candidatePostIds: string[]
): Promise<{ postId: string; similarity: number } | null> {
  if (candidatePostIds.length === 0) return null;

  const results = await prisma.$queryRaw<
    Array<{ post_id: string; similarity: number }>
  >`
    SELECT
      candidate.post_id,
      1 - (candidate.embedding <=> source.embedding) AS similarity
    FROM embeddings source
    JOIN embeddings candidate ON candidate.post_id = ANY(${candidatePostIds}::uuid[])
    WHERE source.post_id = ${sourcePostId}
      AND candidate.post_id != ${sourcePostId}
    ORDER BY candidate.embedding <=> source.embedding ASC
    LIMIT 1
  `;

  if (results.length === 0) return null;
  return {
    postId: results[0].post_id,
    similarity: Number(results[0].similarity),
  };
}
```

**Usage in the generate-suggestion job handler (Box 3):**

```ts
// app/api/jobs/generate-suggestion/route.ts
import { findMostSimilarPost } from "@/lib/embeddings";

// After Stage 1 tag filtering produces `candidates`:
const candidatePostIds = candidates.map((p) => p.id);
const bestMatch = await findMostSimilarPost(newPost.id, candidatePostIds);

if (!bestMatch) {
  return Response.json({ ok: true, suggestion: null });
}

// Look up the matched post's answers for Box 4 scoring
const matchedPost = candidates.find((p) => p.id === bestMatch.postId)!;
```

**Key design decisions:**
- **Post-to-post comparison**, not post-to-answer. Questions and answers have completely different grammar, tone, and sentence structure. Comparing question↔question keeps the vector math symmetric and accurate.
- **Cosine math runs in PostgreSQL**, not TypeScript. The `<=>` operator computes cosine distance natively on the HNSW-indexed vector column — no data leaves the database, no vectors are loaded into serverless function memory.
- **Ranker, not a gate.** Because Stage 1 already carries the safety-critical tag filtering, Stage 2 functions as a **ranker within an already-relevant pool**. No hard `AI_SIMILARITY_THRESHOLD` cutoff is required in this version — it picks the best match from candidates that are already area-confirmed.
- **Origin/destination distinction is baked into the embedding.** The structured prefix `"Route: From [origin] to [destination]"` ensures that *"SM Fairview → BGC"* and *"Cubao → BGC"* produce very different vectors, even though both share the `#Quezon City` area tag. Stage 2 naturally separates them without needing coordinates.
- **Add a threshold later only if needed.** If real usage shows the top-ranked candidate is regularly a poor match despite clearing Stage 1, add an `AI_SIMILARITY_THRESHOLD` env variable as a pass/fail gate at that point. Don't pre-engineer it.

> [!NOTE]
> **Why no hard similarity threshold in v1?** The earlier drafts used `AI_SIMILARITY_THRESHOLD = 0.80` as a standalone gate. With the 2-stage funnel, Stage 1 handles safety-critical filtering (wrong area = excluded). Stage 2 only needs to rank, not gatekeep. If the best candidate after tag filtering scores 0.72, it's *still the best match within that area* — and the confidence tier in Box 4 will honestly label how trustworthy the suggested answer is.

### Clean Separation Summary

| File | Uses Raw SQL? | What It Does |
|------|:---:|------|
| **`lib/embeddings.ts`** | ✅ Yes | `upsertPostEmbedding()`, `findMostSimilarPost()` — all pgvector operations |
| `app/api/jobs/embed-post/route.ts` | ❌ No | Calls `upsertPostEmbedding()` from lib |
| `app/api/jobs/generate-suggestion/route.ts` | ❌ No | Calls `findMostSimilarPost()` from lib |
| `app/actions/*.ts` | ❌ No | Normal Prisma ORM |
| `components/**` | ❌ No | React components |
| Everything else | ❌ No | Normal Prisma ORM |

---

## 6. Box 4 — Trust Check (Confidence Scoring)

Once the best-matching post is identified, its **answers** are scored. This is a separate question from *"was the post relevant?"* — a relevant post might have only spam answers.

```ts
// lib/confidence.ts
export async function computeConfidenceScore(answerId: string): Promise<number> {
  const answer = await prisma.answer.findUniqueOrThrow({
    where: { id: answerId },
    include: { votes: true, reports: true },
  });

  // Hard exclusion: flagged content never gets surfaced
  if (answer.isSpam || answer.isOfftopic) return 0;

  const upvotes = answer.votes.filter((v) => v.voteType === "UPVOTE").length;
  const downvotes = answer.votes.filter((v) => v.voteType === "DOWNVOTE").length;
  const netVotes = upvotes - downvotes;

  // Normalize votes: caps at 10 net votes = max score for this factor
  const normalizedVotes = Math.min(netVotes / 10, 1);

  // Accepted answer bonus
  const acceptedBonus = answer.isAccepted ? 1 : 0;

  // Freshness: decays over months since last confirmation
  const monthsSinceConfirmed =
    (Date.now() - answer.lastConfirmedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const freshnessMultiplier = 1 / (1 + monthsSinceConfirmed / 6);

  // Report penalty: each open report reduces score
  const openReports = answer.reports.filter((r) => r.status === "PENDING").length;
  const reportPenalty = Math.min(openReports * 0.15, 0.6);

  // Weighted formula
  const raw =
    0.4 * normalizedVotes +
    0.2 * acceptedBonus +
    0.2 * freshnessMultiplier -
    0.3 * reportPenalty;

  return Math.max(0, Math.min(1, raw));
}
```

**Formula breakdown:**

| Factor | Weight | What It Measures |
|--------|--------|-----------------|
| Net votes (capped at 10) | **0.4** | Community consensus on answer quality |
| Accepted by OP | **0.2** | Original poster confirmed it worked |
| Freshness (decay over 6mo) | **0.2** | Route recency — transit changes frequently |
| Open reports | **-0.3** | Flagged content is penalized, not immediately hidden |

> [!IMPORTANT]
> The classifier judges **content quality** only (`isSpam`, `isOfftopic`, `isLowEffort`) — never route correctness. Whether a route is actually correct is a **community-vote and reporting matter**, always.

### Picking the Best Answer

```ts
async function pickBestAnswer(
  answers: AnswerWithVotesAndReports[]
): Promise<{ answer: AnswerWithVotesAndReports; confidence: number } | null> {
  if (answers.length === 0) return null;

  let bestAnswer = null;
  let bestConfidence = 0;

  for (const answer of answers) {
    const confidence = await computeConfidenceScore(answer.id);
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestAnswer = answer;
    }
  }

  if (bestConfidence === 0) return null; // all answers were spam/offtopic
  return { answer: bestAnswer!, confidence: bestConfidence };
}
```

---

## 7. The Branch — Suggestion Shown or Nothing Shown

### Confidence Tiers

```ts
function getConfidenceTier(score: number): ConfidenceTier {
  if (score >= 0.7) return "VERIFIED";
  if (score >= 0.4) return "LIKELY";
  return "UNCONFIRMED"; // still shown, weakest framing — NOT excluded
}
```

A thin, unvoted, correct answer isn't excluded outright — it's shown, **honestly labeled by tier**, since low votes reflect visibility, not necessarily quality.

### Creating the Suggestion

```ts
// Inside /api/jobs/generate-suggestion handler, after Stage 3:

if (!bestMatch || bestMatch.post.answers.length === 0) {
  return Response.json({ ok: true, suggestion: null }); // no candidates
}

const best = await pickBestAnswer(bestMatch.post.answers);
if (!best) {
  return Response.json({ ok: true, suggestion: null }); // all answers excluded
}

await prisma.aISuggestion.create({
  data: {
    postId: newPost.id,
    answerId: best.answer.id,
    confidenceScore: best.confidence,
    confidenceTier: getConfidenceTier(best.confidence),
    similarityScore: bestMatch.similarity,
    isCrossMode,
  },
});
```

### What the User Sees

| Tier | UI Display |
|------|-----------|
| **VERIFIED** | *"🤖 AI Note: Community-confirmed answer"* — shown prominently, full answer preview |
| **LIKELY** | *"🤖 AI Note: Matches a previous answer — not yet heavily confirmed"* — softer framing |
| **UNCONFIRMED** | *"🤖 AI Note: Someone answered a similar question — take with caution"* — de-emphasized, still shown |
| *(excluded)* | `isSpam` / `isOfftopic` only — **never surfaced** |

**If `isCrossMode = true`**, the label adds an explicit note:
> *"Note: this answer uses [MRT] instead of [jeepney] — no jeepney-specific answer found yet."*

Honesty about the substitution, not a silent swap.

**If nothing clears even the lowest tier** (all answers scored 0 = hard-excluded): no suggestion is created, and the post simply waits for a real community answer — **the primary path regardless of what the AI pipeline does**.

### Feedback Loop

```ts
// app/actions/ai-actions.ts
export async function rateAISuggestionAction(suggestionId: string, wasHelpful: boolean) {
  await prisma.aISuggestion.update({
    where: { id: suggestionId },
    data: { wasHelpful },
  });
}
```

The `wasHelpful` field accumulates real user signal. Periodically review:
- Suggestions rated `wasHelpful: false` → inspect whether it was a similarity issue (wrong match), confidence issue (spam answer surfaced), or UX issue (good answer, confusing presentation).

---

## 8. Full End-to-End Flow

```mermaid
flowchart TD
    A["Post submitted by user"] --> B["Box 1: Saved + auto-tagged\n(synchronous, 4.5s timeout + regex fallback)"]
    B --> C["Response returned to user\nFeed shows post + tags immediately"]
    C --> D["enqueueJob: embed-post\n(fire and continue)"]

    D -.->|"QStash push"| E["Box 2: Generate embedding\ntext-embedding-3-small"]
    E --> F{"Embedding\nsucceeded?"}
    F -->|No| F2["Set processingStatus = FAILED\nQStash retries with backoff"]
    F -->|Yes| G["Store embedding + set EMBEDDED\nenqueueJob: generate-suggestion"]

    G -.->|"QStash push"| H["Box 3 Stage 1: Filter by AREA tags\n(hard filter, always)"]
    H --> H2["Transport tag filter\n(hard only if user specified mode)"]
    H2 --> J["Box 3 Stage 2: Rank remaining\nby post-to-post cosine similarity"]
    J --> K["Best-matching post identified"]

    K --> L["Box 4: Score that post's answers\n(votes, accepted, freshness, spam flags)"]
    L --> M{"Best answer\nscore > 0?\n(not spam/offtopic)"}
    M -->|No| Z["No suggestion created\nPost waits for community answers"]
    M -->|Yes| N["Assign confidence tier:\nVerified / Likely / Unconfirmed"]
    N --> O["Create AISuggestion record\nFlag isCrossMode if applicable"]
    O --> P["Feed displays tiered AI Note\nwith honest labeling"]
    P --> Q["User rates: Was this helpful? 👍 👎\nLogged for future tuning"]
```

---

## 9. Environment Variables

```env
# Core
OPENAI_API_KEY=

# QStash (Background Jobs)
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
APP_URL=https://your-app.vercel.app

# AI Pipeline Tuning
AI_TAG_TIMEOUT_MS=4500            # Box 1: GPT-4.1-mini auto-tag timeout before regex fallback
AI_CONFIDENCE_VERIFIED=0.7        # Box 4: tier cutoffs (tune once real feedback data exists)
AI_CONFIDENCE_LIKELY=0.4          # Box 4: tier cutoffs
```

> [!NOTE]
> **No hard `AI_SIMILARITY_THRESHOLD`** is configured for Stage 2 in this version. Stage 2 functions as a ranker within an already-filtered pool, not a standalone gate. Add one later only if real usage shows the top-ranked candidate is regularly a poor match despite clearing Stage 1.

---

## 10. Build Order

| Step | What | Dependencies |
|------|------|-------------|
| **1** | pgvector setup: install extension locally, create Prisma migration with `CREATE EXTENSION vector` + HNSW index. Schema changes: add `processingStatus` to Post; add new Answer fields; create `Embedding` (with `Unsupported("vector(1536)")`), `AISuggestion` models, enums | pgvector installed on local PostgreSQL |
| **2** | `lib/embeddings.ts` — the single raw SQL file: `upsertPostEmbedding()` + `findMostSimilarPost()` | Step 1 |
| **3** | Auto-tagging timeout + regex fallback (Box 1) | Step 1 |
| **4** | QStash setup + `lib/qstash.ts` wrapper + `/api/jobs/embed-post` route (Box 2) | Steps 1-2, npm install `@upstash/qstash` |
| **5** | Stage 1 tag filter + Stage 2 pgvector ranking (Box 3, `/api/jobs/generate-suggestion`) | Steps 2 + 4 |
| **6** | Confidence scoring (Box 4) + `lib/confidence.ts` | Step 1 (Answer fields) |
| **7** | `AISuggestion` creation logic + `/api/jobs/generate-suggestion` route | Steps 5 + 6 |
| **8** | Tiered AI Note UI component + `isCrossMode` labeling | Step 7 |
| **9** | `wasHelpful` feedback action + UI rating buttons | Step 8 |

> [!TIP]
> Steps 6 and 8 (confidence scoring and UI) can be built **in parallel** with Steps 4-5 (funnel stages) since they have no code dependencies on each other.
>
> **Future enhancement**: If real usage reveals cases where the 2-stage funnel can't distinguish nearby-but-different locations within the same area tag (e.g., *"Gateway Mall"* vs *"Araneta Center"* — same place, different names), add an optional Google Maps location picker at post creation to collect clean coordinates, and re-introduce a coordinate proximity stage between Stages 1 and 2.

---

## 11. Cold Start Expectation

Expect **few or no suggestions** to clear even the "Unconfirmed" tier at first — that's cold start working as intended, not a bug.

The pipeline needs:
1. Existing posts with embeddings (for Stage 2 to have something to match against)
2. Existing answers on those posts (for Box 4 to have something to score)
3. Some community voting activity (for confidence scores above the lowest tier)

**Seeding strategy**: Collect 50-100 real Q&A pairs from Filipino Facebook commuter groups. Bulk-insert as posts + answers via the seed script, generate embeddings, and auto-tag. This gives the pipeline enough material to start producing suggestions for new posts that match seeded routes.

---

*This spec is the single source of truth for the AI pipeline. Everything else — the implementation plan, the agents doc, prior conversation drafts — defers to this document where they conflict.*
