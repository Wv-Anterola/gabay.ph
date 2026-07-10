# Tero

**Tero** is an independent, UPCAT-focused mock exam and study-guide tool for Filipino students.
Take a free online mock exam, get a readiness score, review every missed answer, and follow a
deterministic 7-day study plan.

> Tero is an independent UPCAT preparation tool and is not affiliated with the University of
> the Philippines or the UP Office of Admissions. The mock exam is not an admissions prediction.
> Results are study guidance only. Questions are original practice questions.

## Tech stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS** (warm-academic claymorphism theme)
- **Prisma + Supabase/Postgres** (waitlist, mock attempts, question responses, analytics mirror)
- **Google Analytics 4** via `@next/third-parties`, loaded only after cookie consent
- **Vitest** for deterministic scoring, import, storage, and study-plan tests
- **Lucide** icons (no emoji icons)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in values (optional for local UI)
npx prisma generate
npm run dev                  # http://localhost:3000
```

The landing page, mock exam, results, review, dashboard, and practice flows all work **without a
database** (attempts/results live in `localStorage`). A database is only needed for the waitlist and
to persist mock attempts/question responses.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm test` | Run Vitest |
| `npm run questions:import` | Validate Markdown questions and generate versioned source |
| `npx prisma migrate dev` | Apply the schema to your database |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | For waitlist / attempt saving | Pooled Postgres runtime connection string |
| `DIRECT_URL` | For migrations | Direct Postgres connection (port 5432) |
| `NEXT_PUBLIC_GA_ID` | For analytics | GA4 measurement id (e.g. `G-XXXXXXXXXX`); leave empty to disable analytics |

If `DATABASE_URL` is missing, all exam, results, review, and dashboard flows still work through
browser storage. Persistence endpoints return a structured `persisted: false` response; waitlist
signup correctly remains unavailable because it cannot be saved without a database.

## Database setup notes

1. Create a Supabase project and copy the Postgres connection strings into `.env.local`
   (`DATABASE_URL` = pooled URL on port 6543; `DIRECT_URL` = direct URL on port 5432).
2. Run `npx prisma generate` to build the client, then `npx prisma migrate dev` locally (or
   `npx prisma migrate deploy` in production) to create the
   `WaitlistSignup`, `DiagnosticSession`, `MockAttempt`, `MockQuestionResponse`, and
   `AnalyticsEvent` tables.
3. On Vercel, set the same env vars in the project settings. The pooled URL is required for
   serverless functions; the direct URL is only used by migrations.
4. The API includes a lightweight per-instance write limit. Before running multiple production
   instances, also configure a distributed rate limit at the hosting edge (for example, Vercel
   WAF or Cloudflare); an in-memory limit is intentionally not a cross-instance security boundary.

## Adding or editing UPCAT questions

Runtime questions live in versioned source under `lib/questions/` as typed data
(`lib/types.ts` defines the `Question` schema). Draft reviewer Markdown belongs in
`question-bank/`; run `npm run questions:import` to validate and generate source files.

To add a question:

1. Append a new object to the relevant module array.
2. Give it a unique `id`, a `topic` (this drives weak-topic detection), 4 `choices`, the
   correct `answer`, and an `explanation`.
3. Set `sourceType: "original_generated"` and `reviewStatus`.

**Only `reviewStatus: "approved"` questions are served.** Use `"needs_review"` while drafting.
All user-facing questions must be **original** — never copy, paraphrase, or reuse real UPCAT
reviewer items, choices, passages, diagrams, answer keys, or explanations.

## How scoring works (`lib/scoring.ts`)

Deterministic, no AI, no randomness:

- Per section: `accuracy = correct / total` (unanswered counts as not correct).
- Weighted score uses difficulty weights: easy `1`, medium `1.25`, hard `1.5`.
- Per topic: accuracy across that topic's items.
- **Weak topic** = below 60% **or** below the module's own average (surfaces relative gaps).
- **Readiness labels:** Strong ≥ 80%, Steady 60–79%, Needs work < 60%. Always shown with an
  icon + text, never color alone.
- The 7-day plan (`lib/studyPlan.ts`) ranks weak topics by urgency and spreads them across days.

Language is intentionally a **readiness signal**, never an admissions prediction. The code never
uses pass, fail, chance of admission, or guaranteed-improvement wording.

## Analytics & consent

- All product code calls `trackEvent(name, props)` from `lib/analytics.ts` — never `gtag`
  directly — so the analytics sink is swappable.
- GA4 is mounted (in `ConsentBanner.tsx`) **only after the visitor accepts** the cookie banner.
  Decline = no GA script, no analytics cookies; `trackEvent` becomes a no-op.
- The consent model and Google's role as processor are documented on `/privacy`.

## Project structure

```
app/
  page.tsx                 # landing
  diagnostic/              # mock start + full exam runner
  results/                 # readiness results + answer review
  dashboard/               # previous attempts + retake
  practice/[module]/       # weak-area practice
  waitlist/  privacy/      # capture + disclosure
  api/waitlist  api/session  api/mock-attempt
  components/{ui,brand,landing,diagnostic,results,practice,waitlist,shared}
lib/
  questions/  scoring.ts  studyPlan.ts  analytics.ts  storage.ts  db.ts  types.ts
prisma/schema.prisma
design-system/gabay/       # UI UX Pro Max design tokens (source of truth)
```

## Brand & independence

Tero uses a brand-owned warm-academic palette (deep berry, botanical teal, mango, parchment,
espresso) that is deliberately not the official UP colors, and uses no UP logo, seal, Oblation
imagery, or official marks. We use only "independent UPCAT preparation tool," "UPCAT-focused,"
and "for UPCAT prep." The required disclaimer appears on the homepage footer, mock start,
results page, and privacy page.

## Security / audit status

Run `npm audit` after dependency changes. The current tree may include moderate advisories from
transitive tooling dependencies; evaluate fixes separately so the MVP does not absorb unrelated
breaking upgrades.

## Question review workflow

Questions in `lib/questions/*` carry a `reviewStatus` (`needs_review` | `approved` | `rejected`).
**Only `approved` items are served** (filtered in `lib/questions/index.ts`). Draft new items as
`needs_review`, have a subject-matter reviewer verify correctness and originality, then flip to
`approved`. Never copy or closely paraphrase real UPCAT reviewer content.

## Known limitations

- **Git:** this folder currently lives inside an unrelated parent git repository. Do **not** commit
  Tero into that parent. Initialize a separate repo here (`git init` in this directory) before
  committing, or move the project out first.
- DB persistence is best-effort: without `DATABASE_URL`, `/api/waitlist` returns a clear `503` and
  exam/session persistence returns non-crashing "not persisted" responses; the mock still works
  fully via `localStorage`.
- Light mode only (no dark theme). Desktop-first; responsive down to mobile but tuned for desktop.
- Question accuracy and difficulty calibration still need a subject-matter-expert review pass
  before public launch.

## Local dev note

The Next dev-tools "Segment Explorer" overlay is disabled in `next.config.ts`
(`experimental.devtoolSegmentExplorer: false`) because it intermittently throws a React Client
Manifest error under `next dev` in Next 15.5.x. This is a dev-only toggle with no effect on the
app or the production build.
