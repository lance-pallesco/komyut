# AI Prompt: KOMYUT Phase 1 MVP Scaffold

> **Usage**: Feed this entire prompt into your agentic AI coding assistant. It is scoped exclusively to Phase 1 — the community feed homepage. Nothing beyond that.

---

## PROMPT START

You are a senior full-stack engineer building the MVP of **KOMYUT** — a community-driven commuter Q&A platform for the Philippines. Your immediate task is to scaffold the Phase 1 frontend: the community feed homepage, visually complete with mock data, no backend integration.

---

### CONTEXT: WHY THIS EXISTS

#### The Problem

Filipino commuters rely on word-of-mouth for navigation. Every day in Facebook commuter groups (millions of combined members), the same pattern repeats: someone asks "Paano pumunta sa ___?", a helpful person answers in a comment, and that answer disappears into the feed within hours. The next day, someone asks the same question. The knowledge exists but Facebook cannot make it permanent, structured, or searchable.

Google Maps and Waze fail because they do not map informal transport: jeepney routes, tricycle TODA zones, UV Express terminals, or the landmark-based directions Filipinos use ("baba ka sa 7-Eleven, tawid ka, may jeep dun"). Wrong directions are dangerous — they strand people in unfamiliar places, cost money on wrong vehicles, or route people somewhere unsafe at night.

#### The Solution

KOMYUT is a community Q&A platform (not a search engine, not an AI chatbot) where commuters post questions and other commuters answer. The community is the source of truth. Think of it as Stack Overflow for Filipino commute directions — permanent, structured, searchable, and verifiable. The AI layer (Phase 3, not now) will only surface existing community answers, never generate routes.

#### Target Market

Filipino commuters, primarily **Gen Z and Millennials** (18-35) in Metro Manila. They are:
- Mobile-first — 90%+ access the internet via smartphone, many on budget Android devices
- Data-conscious — they avoid heavy apps; fast load times and lightweight design matter
- Socially driven — they already ask and answer commute questions in Facebook groups
- Taglish-native — they communicate in mixed Tagalog and English naturally
- Visually oriented — they gravitate toward clean, modern interfaces (Instagram, TikTok, Threads aesthetic)

#### Competitor Landscape

| Competitor | What They Do Right | Where They Fail |
|:-----------|:-------------------|:----------------|
| **Sakay.ph** | Maps informal transport (jeepneys, UV Express). Step-by-step directions. | Data goes stale. No community input. No Q&A. Limited coverage outside Manila. |
| **Google Maps** | Universal. Reliable for MRT/LRT. | Does not map jeepneys, tricycles, pedicabs. No landmark-based directions. No local knowledge. |
| **Facebook Groups** | Massive audience. Real community knowledge. Trust through social proof. | Answers are ephemeral. Unsearchable. No structure. Same questions asked daily. No quality ranking. |
| **Moovit** | Clean UI. Multi-modal. | Limited Philippine data. No community input. Formal transit bias. |

**KOMYUT's gap**: The community knowledge that Facebook has, but permanent, structured, and searchable like Stack Overflow.

---

### WHAT YOU ARE BUILDING (Phase 1 Only)

Scaffold the **community feed homepage**. This is a Next.js 14+ App Router project with TypeScript, Tailwind CSS, and shadcn/ui. The scaffold must be visually complete with mock data. No backend, no auth integration, no AI, no maps. Pure frontend.

**Phase 1 scope — what to build:**
- Navbar with search input and CTA button
- 3-column responsive layout (left sidebar, feed, right sidebar)
- Post cards with vote column, route display, metadata, interaction bar
- Feed tabs (Latest, Trending, Unanswered)
- Region filter pills
- Right sidebar widgets (trending routes, top contributors, community stats)
- Left sidebar navigation
- Mobile bottom navigation
- Loading skeletons
- Dark mode support
- Mock data that feels real

**Explicitly out of scope (do NOT build):**
- Authentication / login flows
- Backend API integration
- Database or Supabase setup
- AI/RAG features
- Map integration
- Notification system
- Post detail page
- Answer/reply forms
- User profile pages

---

### DESIGN: LAWS OF UX APPLIED

Every design decision in this scaffold must be grounded in established UX principles. The following laws from lawsofux.com are directly applicable:

#### Jakob's Law
> Users spend most of their time on other sites. They prefer your site to work the same way as all the other sites they already know.

- The feed layout must feel familiar to users of Reddit, Facebook, and Stack Overflow. Do not invent novel navigation patterns. Use a standard 3-column layout. Put the vote column where Reddit puts it (left side of the card). Put the interaction bar where Twitter/Threads put it (bottom of the card).

#### Hick's Law
> The time it takes to make a decision increases with the number and complexity of choices.

- Limit feed tabs to 3-4 maximum (Latest, Trending, Unanswered, Following). Do not add more.
- Region filter shows 5-6 visible pills plus a "More" overflow. Not 15 pills in a row.
- The post card shows essential metadata only: origin, destination, answer count, upvote count, time, author. No visual noise.

#### Fitts's Law
> The time to acquire a target is a function of the distance to and size of the target.

- Mobile touch targets must be minimum 44px (Apple HIG) to 48px (Material).
- The "Ask a Question" CTA must be the largest, most prominent button on the page.
- Mobile bottom navigation icons must be generously spaced with large tap areas.
- Vote buttons must be large enough to tap without accidentally hitting the wrong one.

#### Miller's Law
> The average person can only keep 7 (plus or minus 2) items in their working memory.

- Each post card should expose no more than 5-7 distinct pieces of information: author, origin/destination, body preview, status, upvote count, answer count, time.
- Right sidebar shows top 5 trending routes and top 3-5 contributors. Not 10 or 20.

#### Aesthetic-Usability Effect
> Users often perceive aesthetically pleasing design as design that is more usable.

- The scaffold must look polished and premium. This is not a wireframe. It must feel like a shipped product. Clean typography, consistent spacing, subtle transitions, proper hover states.

#### Law of Proximity
> Objects that are near each other tend to be grouped together.

- In the post card: group author info together (avatar + name + time). Group route info together (origin + destination). Group interaction actions together (vote + answers + share + bookmark). Use spacing and separators to create clear visual groups.

#### Serial Position Effect
> Users have a propensity to best remember the first and last items in a series.

- The most important actions go first and last in the interaction bar. Upvote first (most important signal), bookmark last (personal action). Answer count and share in the middle.

#### Von Restorff Effect (Isolation Effect)
> When multiple similar objects are present, the one that differs from the rest is most likely to be remembered.

- The "Ask a Question" CTA button should be the only element with the primary accent color in the navbar. Everything else is neutral. This makes it visually "pop."
- Verified posts should have a distinct green visual treatment that makes them stand out from the feed.

#### Peak-End Rule
> People judge an experience largely based on how they felt at its peak and at its end.

- The loading experience matters. Use shadcn Skeleton components for smooth loading states — not blank screens, not spinners.
- Empty states should feel helpful, not broken. "No unanswered questions in Metro Manila right now" is better than a blank page.

---

### DESIGN: VISUAL REFERENCES

#### Primary Reference: Forume (Attached Image)

Study the attached reference image carefully. Extract these specific patterns:

1. **Vote column placement** — Upvote/downvote arrows and count are positioned to the LEFT of the card content, vertically centered. This is the Reddit/Stack Overflow pattern. Adopt this exact placement.

2. **Card content structure** — Title is bold and prominent. Body text is a preview paragraph below. Author info (avatar + name + time ago + comment count) is at the bottom in a horizontal row with muted styling. Adopt this hierarchy.

3. **Left sidebar** — Clean, minimal. Menu section with icon + label pairs. Clear active state (filled background on the active item). Compact. Does not compete with the main feed for attention.

4. **Right sidebar** — CTA button ("Start a New Topic") is the first and most prominent element. Below it, a "Top Users" leaderboard with avatar + name + score. Clean, minimal, does not overwhelm.

5. **Overall aesthetic** — White/light background. Cards separated by whitespace (no visible card borders in some designs, or very subtle ones). Clean sans-serif typography. Single accent color (blue/indigo). Professional, not playful.

6. **Density** — The cards show a meaningful amount of text (the full question or a generous preview), not just a one-line title. This gives users enough context to decide whether to click in.

#### Secondary References (Synthesize the Best of Each)

| Platform | What to Adopt | What to Avoid |
|:---------|:--------------|:--------------|
| **Stack Overflow** | Vote count column, accepted answer indicator (green check), tag badges, question status (solved/unsolved). Clean information density. | Dated visual styling. Dense, developer-centric aesthetic. |
| **Reddit** | 3-column layout structure. Upvote interaction pattern (color change on vote). Community badge next to author. Card-based feed. | Visual noise (awards, flair, premium icons). Excessive color. |
| **Discourse** | Topic status system (solved, pinned, open). User trust levels. Category badges. "Solved" green banner on resolved topics. | Enterprise-feeling UI. Can feel sterile. |
| **Flarum** | Ultra-clean minimalist aesthetic. Smooth animations. Lightweight feel. Floating compose button. | Too minimal for information-dense Q&A. |
| **Dev.to** | Content-first typography. Clean interaction bar (reactions + comments). Tag-based filtering. | Blog-centric layout (not ideal for Q&A). |
| **Quora** | Question-first display. "Answer this" CTA on unanswered items. Answerer credentials shown. | Cluttered feed. Aggressive prompts. |
| **Threads (Meta)** | Generous whitespace. Mobile-first sizing. Subtle dividers. Premium feel. Avatar-led post layout. | Too simple for structured Q&A data. |
| **Circle** | Polished, modern spaces layout. Premium visual quality. Active members sidebar. Clean navigation with icon + label. | Membership/paywall focus. |

#### Design Synthesis

Combine influences into a cohesive identity:

- **Layout**: Forume reference image (3-column, vote column left)
- **Card structure**: Forume + Reddit (vote left, content center, metadata bottom)
- **Visual polish**: Flarum + Threads (clean, airy, premium)
- **Information architecture**: Stack Overflow + Discourse (status indicators, tags)
- **Interaction patterns**: Reddit (vote) + Dev.to (interaction bar)
- **Mobile experience**: Threads (whitespace, touch targets, bottom nav)
- **Navigation**: Circle + Forume (icon + label sidebar)
- **CTA placement**: Forume (right sidebar, prominent button)

---

### CLEAN CODE AND BEST PRACTICES (STRICTLY ENFORCED)

#### Separation of Concerns — Three Layers

**UI Layer (Components)** — Render UI only. Receive data via props. No business logic. Max 150 lines per file.

**Logic Layer (Hooks)** — Custom hooks for stateful logic and side effects. Pure utility functions for data transformation.

**Data Layer (Types, Constants, Mock Data)** — All TypeScript types in `types/`. All static constants in `lib/constants.ts`. All mock data in `lib/mock-data.ts`. No hardcoded strings or magic numbers in components.

#### shadcn/ui Rules

- shadcn/ui is already installed. Use it for ALL UI primitives.
- NEVER manually create a component that shadcn provides (Button, Card, Badge, Avatar, Input, etc.).
- If you need a shadcn component not yet installed, request permission to run `npx shadcn@latest add <component>`. Do NOT manually create it.
- Custom components (PostCard, VoteButton, etc.) are COMPOSED from shadcn primitives.

#### Component Pattern

```tsx
// 1. React/Next imports
// 2. Third-party imports (lucide-react)
// 3. Internal imports (ui, then domain, then shared)
// 4. Hooks, utils, constants
// 5. Types (always last, with `type` keyword)

interface PostCardProps {
  post: Post;
  onUpvote?: (id: string) => void;
}

export function PostCard({ post, onUpvote }: PostCardProps) {
  // Component body — composed from shadcn primitives
}
```

#### Forbidden Patterns

- No inline styles — Tailwind classes only
- No `any` type — strict TypeScript
- No default exports — named exports everywhere
- No components over 150 lines — break them down
- No `div` soup — use semantic HTML (`main`, `nav`, `aside`, `article`, `section`)
- No hardcoded strings in JSX — extract to constants
- No duplicating shadcn components — use the installed ones
- No prop drilling beyond 2 levels

#### Server vs Client Boundary

- Server Components by default. Add `"use client"` only for interactivity (useState, onClick, etc.).
- Push `"use client"` as deep as possible into leaf components.
- Data flows from Server Components to Client Components via props.

---

### PROJECT STRUCTURE

```
src/
├── app/
│   ├── layout.tsx              # Root layout: font, theme provider, navbar
│   ├── page.tsx                # Homepage: composes FeedLayout
│   ├── globals.css             # Design tokens, Tailwind base
│   └── fonts.ts                # Inter font via next/font/google
├── components/
│   ├── ui/                     # shadcn primitives (auto-generated, do NOT edit)
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── left-sidebar.tsx
│   │   ├── right-sidebar.tsx
│   │   ├── mobile-bottom-nav.tsx
│   │   └── feed-layout.tsx     # 3-column responsive grid
│   ├── feed/
│   │   ├── post-card.tsx       # The core card component
│   │   ├── post-list.tsx       # List with loading/empty states
│   │   ├── post-route-display.tsx  # Origin -> Destination visual
│   │   ├── feed-tabs.tsx
│   │   └── region-filter.tsx
│   ├── sidebar/
│   │   ├── trending-routes.tsx
│   │   ├── top-contributors.tsx
│   │   ├── community-stats.tsx
│   │   └── about-card.tsx
│   └── shared/
│       ├── transport-badge.tsx
│       ├── vote-button.tsx
│       ├── user-info.tsx
│       ├── status-badge.tsx
│       └── theme-toggle.tsx
├── hooks/
│   ├── use-feed-filter.ts
│   └── use-mobile-detect.ts
├── lib/
│   ├── utils.ts                # shadcn cn() — do NOT edit
│   ├── constants.ts            # Regions, transport modes, nav items, labels
│   ├── mock-data.ts            # All mock data
│   └── formatters.ts           # formatRelativeTime, formatNumber, etc.
└── types/
    └── index.ts                # Post, User, Region, TransportMode, etc.
```

---

### POST CARD COMPONENT — DETAILED SPEC

This is the most important component. It follows the Forume reference layout: vote column on the left, content on the right.

```
+-------------------------------------------------------------------+
|                                                                     |
|   +------+  +---------------------------------------------------+  |
|   |      |  |                                                   |  |
|   | [Up] |  |  [Avatar] Username · Region Badge · 2h ago        |  |
|   |      |  |                                                   |  |
|   |  24  |  |  [MapPin] SM North EDSA                           |  |
|   |      |  |      |                                            |  |
|   | [Dn] |  |      v                                            |  |
|   |      |  |  [MapPin] BGC High Street                         |  |
|   +------+  |                                                   |  |
|             |  "First time ko pumunta dito, may UV Express      |  |
|             |   ba or jeep lang?"                                |  |
|             |                                                   |  |
|             |  [Bus] Bus  [Train] MRT  [Walk] Walk              |  |
|             |                                                   |  |
|             |  - - - - - - - - - - - - - - - - - - - - - - -    |  |
|             |                                                   |  |
|             |  [MessageSquare] 3 answers   [Check] Verified     |  |
|             |  [Share2] Share   [Bookmark] Save                 |  |
|             |                                                   |  |
|             +---------------------------------------------------+  |
|                                                                     |
+-------------------------------------------------------------------+
```

#### Vote Column (Left Side)

- Vertical stack: Up arrow, count, Down arrow
- Uses shadcn `Button` (ghost variant, size sm)
- Icons: Lucide `ChevronUp`, `ChevronDown` (not ArrowBigUp — too heavy for this layout)
- Count: `text-sm font-semibold` centered between arrows
- Active state: accent color fill when user has voted
- The entire vote column is a narrow strip (~48px wide), separate from the card content

#### Post Card States

| State | Visual Treatment |
|:------|:-----------------|
| **Unanswered** | Subtle amber/warning outline or badge. "Be the first to answer" text in the interaction bar. Slightly muted card. |
| **Answered** | Normal styling. Answer count shown. Transport mode badges visible. |
| **Verified** | Green left border accent (4px) or green check badge. Verified answer indicator prominently visible. |
| **Pinned** | Subtle background tint. Pin icon next to timestamp. Always sorted to top. |

---

### COLOR PALETTE

```css
/* Light Mode */
--background:       hsl(0 0% 97.5%);     /* warm off-white page background */
--card:             hsl(0 0% 100%);       /* white cards */
--card-border:      hsl(0 0% 91%);        /* subtle border */
--foreground:       hsl(0 0% 9%);         /* near-black text */
--muted-foreground: hsl(0 0% 46%);        /* secondary text */
--primary:          hsl(230 65% 52%);      /* indigo-blue accent (CTA, active vote) */
--primary-foreground: hsl(0 0% 100%);     /* white text on primary */
--success:          hsl(142 64% 42%);      /* green for verified */
--warning:          hsl(38 92% 50%);       /* amber for unanswered */
--destructive:      hsl(0 84% 60%);        /* red for flags */

/* Dark Mode */
--background:       hsl(0 0% 7%);
--card:             hsl(0 0% 11%);
--card-border:      hsl(0 0% 18%);
--foreground:       hsl(0 0% 95%);
--muted-foreground: hsl(0 0% 55%);
--primary:          hsl(230 65% 62%);      /* lighter indigo for dark */
```

**Typography**: Inter via `next/font/google`. Hierarchy:
- Post route names: `text-base font-semibold leading-tight`
- Body preview: `text-sm text-muted-foreground leading-relaxed line-clamp-2`
- Metadata: `text-xs text-muted-foreground`
- Section headings (sidebar): `text-xs font-medium uppercase tracking-wider text-muted-foreground`

---

### SHADCN COMPONENTS TO USE

These are assumed installed:
```
avatar, badge, button, card, dropdown-menu, input,
scroll-area, separator, sheet, skeleton, tabs,
toggle, toggle-group, tooltip
```

If you need any additional shadcn components, request `npx shadcn@latest add <name>` and wait for approval.

---

### MOCK DATA

Create 8-10 posts in `lib/mock-data.ts` using real Philippine locations and Taglish content:

- 2 verified posts (high upvotes, 3+ answers, green indicator)
- 3 answered posts (1-2 answers, moderate upvotes)
- 2 unanswered posts (0 answers, recent, "be the first" prompt)
- 1 pinned post (community guide or frequently asked route)

Example post:
```typescript
{
  id: "1",
  author: { name: "Carlo M.", username: "carlom", badge: "Route Master" },
  origin: "SM North EDSA",
  destination: "BGC High Street",
  body: "First time ko pumunta sa BGC. May UV Express ba dito or jeep lang? Saan yung terminal?",
  region: "Metro Manila",
  transportModes: ["MRT", "Bus"],
  answerCount: 3,
  upvoteCount: 24,
  status: "verified",
  createdAt: "2h ago"
}
```

Use real locations: SM North EDSA, BGC, Cubao, Makati, Ortigas, Antipolo, Alabang, Fairview, Katipunan, UP Diliman, Megamall, Trinoma, Eastwood, Baguio, Cebu IT Park.

---

### RESPONSIVE BREAKPOINTS

| Viewport | Layout | Key Changes |
|:---------|:-------|:------------|
| Mobile (<768px) | Single column | Hide sidebars. Show mobile bottom nav. Horizontal scroll for tabs and region pills. Vote column inline or below card (not side-by-side). |
| Tablet (768-1024px) | Two column | Show main feed + right sidebar. Hide left sidebar. |
| Desktop (>1024px) | Three column | Full layout: left sidebar (240px) + feed (flex) + right sidebar (300px). |

---

### TECHNICAL CONSTRAINTS

1. Next.js 14+ App Router, TypeScript strict
2. shadcn/ui for all primitives — do not create any primitive manually
3. Tailwind CSS only — no inline styles, no custom CSS classes
4. Lucide React for icons — no emojis
5. Inter font via next/font/google
6. Mobile-first responsive design
7. Dark mode via next-themes
8. Semantic HTML — no div soup
9. Named exports only
10. Max 150 lines per file
11. `"use client"` only where needed, pushed to leaf components

---

### QUALITY BAR

This scaffold must look like a launched product, not a prototype.

- Every interactive element has hover, focus, and active states
- Transitions are subtle (150-200ms ease)
- Loading: shadcn Skeleton components for post cards (3-4 skeleton cards)
- Empty states: helpful message for each tab when no results
- Mobile: feels native — no janky scroll, proper touch targets (min 44px), smooth tab switching
- Card hover: subtle elevation change or border accent
- Vote button: satisfying micro-interaction on click (scale + color change)

---

### DELIVERABLES

1. Scaffolded Next.js project following the exact file structure above
2. Working homepage with 3-column feed, navigation, sidebars, filtering
3. Mock data in `lib/mock-data.ts`
4. Types in `types/index.ts`
5. Constants in `lib/constants.ts`
6. Responsive mobile/tablet/desktop layouts
7. Dark mode toggle
8. Loading skeleton states
9. Empty states for feed tabs
10. Clean code following every rule above

This is Phase 1 only. Do not build anything beyond the feed homepage scaffold.

## PROMPT END
