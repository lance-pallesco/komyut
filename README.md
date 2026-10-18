# KOMYUT

**KOMYUT** is a community-driven commuter Q&A platform for the Philippines. It turns the practical route advice normally buried in social-media threads into a searchable, persistent community knowledge base.

Commuters can ask how to travel from one place to another, share the routes they have actually used, vote on helpful contributions, and save useful posts for later. The current MVP centers on a mobile-friendly community feed.

> **Community is the source of truth.** AI helps retrieve relevant, human-written answers; it does not generate commute directions or present itself as an authority.

## Why KOMYUT

Informal Philippine transport is often landmark-based: jeepney routes, tricycle boundaries, UV Express terminals, and familiar places such as malls or stations are not always captured by conventional mapping apps. Useful route knowledge exists within commuter communities, but it is difficult to find again once a post disappears down a social feed.

KOMYUT preserves that knowledge as an open Q&A archive where answers can be revisited, ranked, and improved by the community.

## Current MVP

- Landing page and responsive, filterable community feed
- Questions with origin, destination, region, transport tags, and optional anonymous posting
- Threaded answers and replies, answer voting, post likes, and post bookmarks
- Feed search plus region, tag, and sort filtering
- User profiles, saved posts, personal questions, leaderboards, community rules, and notifications
- Credentials, Google, and Facebook authentication through NextAuth
- Post author controls for editing, deleting, and enabling or disabling comments
- Automatic tag normalization with an OpenAI-compatible model and a local dictionary fallback
- Background retrieval of similar, human-authored answers with confidence tiers and helpful/not-helpful feedback

## AI safety boundary

The AI pipeline is deliberately a retrieval aid, not a route planner.

1. A new question is saved and tagged. The tagger may normalize locations, transport modes, and contextual tags; it falls back to a local dictionary if no AI service is available.
2. The question is embedded with its origin, destination, title, and details using `text-embedding-3-small` (or the configured compatible embedding model).
3. Candidate posts must share an area tag. When a transport preference is present, same-mode candidates are preferred.
4. pgvector ranks candidates by cosine similarity. The current default similarity threshold is `0.65`.
5. The matched post's answers are confidence-ranked using community votes, verification, freshness, and open reports. Spam and off-topic answers are excluded.
6. The UI attributes a suggestion to its original community answer and records optional feedback.

The application never asks an LLM to invent, rewrite, or infer commute instructions.

## Architecture

| Area | Implementation |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS v4, Shadcn/Base UI primitives, Lucide icons |
| Reads | Server Components and shared Prisma query helpers |
| Writes | Next.js Server Actions in `app/actions/` |
| Database | PostgreSQL, Prisma 7, and pgvector |
| Authentication | NextAuth v4 with credentials, Google, and Facebook providers |
| AI | OpenAI-compatible chat completions for tagging; embeddings for similarity retrieval |
| Background work | Upstash QStash in production or with the local emulator; in-process fallback during local development |

The API routes currently serve NextAuth and the internal AI job handlers. Application mutations such as creating posts, replying, voting, saving, and profile changes use Server Actions.

## Project structure

```text
app/
  actions/                 Server Actions for posts, answers, votes, auth, users, uploads, and AI feedback
  api/
    auth/[...nextauth]/    NextAuth handler
    jobs/                  Background embedding and suggestion handlers
  feed/                    Community feed page
  post/[id]/               Shareable post detail page
  leaderboards/            Contributor rankings
  my-questions/            Signed-in user's questions
  profile/, saved/, user/  Profile and saved-post views
  rules/                   Community rules
components/
  feed/, post/             Feed cards, composer, answer thread, and AI suggestion UI
  layout/, sidebar/        Desktop shell, mobile navigation, and community widgets
  profile/, saved/         Account-focused views
  shared/, ui/             Reusable domain components and UI primitives
lib/
  ai-pipeline.ts           Embedding and human-answer retrieval orchestration
  embeddings.ts            pgvector read/write boundary
  confidence.ts            Answer confidence calculation and tiering
  db-posts.ts              Feed, post, bookmark, and profile query helpers
  auth.ts, qstash.ts       Authentication and job-queue configuration
prisma/
  schema.prisma            PostgreSQL data model
  seed.ts                  Development seed data
types/                     Shared TypeScript domain types
```

## Data model

The core entities are `User`, `Post`, `Answer`, `Vote`, `Bookmark`, `Tag`, and `Notification`. Answers can form reply threads. `AISuggestion` records link a new question to one selected, existing human answer along with similarity, confidence, transport-mode, and user-feedback data. `Embedding` stores native `vector(1536)` values for posts and reserves answer embeddings for future use.

## Local development

### Prerequisites

- Node.js 20 or later
- PostgreSQL with the [pgvector](https://github.com/pgvector/pgvector) extension available
- An OpenAI-compatible API key only if you want AI tagging and similarity retrieval locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file. Keep credentials out of source control.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App URL, for example `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Secret used to sign NextAuth sessions |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | No | Google sign-in |
| `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | No | Facebook sign-in |
| `OPENAI_API_KEY` | No | Enables AI tag normalization and embeddings |
| `OPENAI_BASE_URL` | No | Alternative OpenAI-compatible API base URL |
| `OPENAI_MODEL` | No | Tagging model; defaults to `gpt-4.1-mini` |
| `OPENAI_EMBEDDING_MODEL` | No | Embedding model override |
| `APP_URL`, `QSTASH_TOKEN` | No | Enables QStash background jobs in production |
| `QSTASH_URL` | No | Connects to the local QStash emulator |

Without QStash, local development falls back to an in-process background runner. Without `OPENAI_API_KEY`, tag extraction falls back to the local keyword dictionary; embedding-based suggestions require an embedding provider.

### 3. Initialize the database

Make sure the database role can enable pgvector, then create the schema and development data:

```bash
npm run db:push
npm run db:seed
```

### 4. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Generate Prisma Client and create a production build |
| `npm run start` | Run the production server after building |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting files |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:push` | Push the Prisma schema to the configured database |
| `npm run db:seed` | Seed local development data |
| `npm run qstash` | Start the QStash development workflow |

## Verification

At the time this README was updated, the repository passes:

```bash
npm run lint
npx tsc --noEmit
```

## Product principles

- Human commuters own the route knowledge and its correction.
- A retrieved answer stays attributed to its human author and source post.
- Filipino and Taglish, landmarks, and informal transport modes are first-class context.
- The feed is the primary experience and must remain practical on mobile devices.
- Questions remain useful over time as the community contributes newer or better information.
