# Persistence Roadmap

## Goal

Move Tero from browser-only exam continuity to durable, backend-backed persistence while preserving the current no-login MVP flow.

The current app works without a database: attempts, results, review data, and dashboard history are stored in `localStorage`. Postgres persistence already exists as a best-effort write sink for waitlist signups, module diagnostic sessions, full mock attempts, and per-question responses. The next step is making that stored data useful through validated write paths, read APIs, and operational checks.

## Current State

### Already Implemented

- Prisma/Postgres schema for:
  - `WaitlistSignup`
  - `DiagnosticSession`
  - `MockAttempt`
  - `MockQuestionResponse`
  - `AnalyticsEvent`
- `POST /api/waitlist` for waitlist signup capture.
- `POST /api/session` for single-module diagnostic session writes.
- `POST /api/mock-attempt` for full mock exam attempt and per-question response writes.
- DB-less mode: app pages keep working when `DATABASE_URL` is missing.
- Browser persistence through `localStorage` for:
  - in-progress mock attempt resume
  - submitted results
  - answer review
  - dashboard attempt history

### Not Yet Implemented

- Backend read APIs for results, review, or dashboard history.
- Server-side reconstruction of a submitted mock result from persisted rows.
- Strong runtime payload validation for API requests.
- Route-level backend tests for API behavior.
- Abuse protection for write endpoints.
- Clear decision on whether Supabase auth helpers are in scope for MVP.

## Persistence Principles

- Keep localStorage as the first-line no-login experience for MVP.
- Treat Postgres as durable recovery and analytics storage, not as the source of runtime question content.
- Keep question content source-controlled under `lib/questions/` and `question-bank/`.
- Avoid requiring accounts before the product has proven the free mock flow.
- Never block result display on a failed backend write.
- Prefer deterministic, typed payloads over loose JSON blobs where the data will be queried later.

## Phase 1: Harden Existing Writes

Target: Make the current write-only backend reliable enough for public testing.

Tasks:

- Add shared validation helpers for API payloads.
- Validate `/api/mock-attempt` deeply:
  - matching attempt/result IDs
  - allowed status values
  - valid module IDs
  - valid choice IDs
  - valid difficulty values
  - numeric ranges for timing and scores
  - response count within expected bounds
- Validate `/api/session` score and answer shape.
- Normalize API error responses into a consistent `{ ok, persisted, error, message }` shape.
- Add route tests for:
  - invalid JSON
  - missing DB configuration
  - malformed payloads
  - successful persistence with mocked Prisma
- Add basic server logging for failed persistence attempts.

Exit criteria:

- `npm test` covers API validation and DB-disabled behavior.
- Bad payloads fail with clear `4xx` responses.
- DB outages still leave localStorage results intact.

## Phase 2: Add Backend Read APIs

Target: Let submitted attempts be recovered from Postgres when localStorage is unavailable.

New endpoints:

- `GET /api/mock-attempts?clientId=<id>`
  - returns attempt summaries for dashboard history.
- `GET /api/mock-attempt/:attemptId?clientId=<id>`
  - returns one persisted attempt plus reconstructed result data.
- `GET /api/mock-attempt/:attemptId/review?clientId=<id>`
  - returns per-question review rows in UI-ready order.

Implementation notes:

- Require `clientId` match for anonymous access.
- Return `404` when the attempt does not exist or does not belong to the client.
- Keep response shapes close to existing `MockExamAttempt`, `MockExamResult`, and `MockQuestionReview` types.
- Rehydrate current question text, choices, explanations, and images from source-controlled question data by `questionId`.
- Do not store or serve raw question content from the database in this phase.

Exit criteria:

- Results page can recover a persisted result by `attemptId`.
- Review page can recover persisted question review data.
- Dashboard can show persisted attempt history for the same browser client ID.

## Phase 3: Local-First Client Fallback

Target: Preserve the current UX while adding backend recovery.

Read strategy:

1. Try localStorage.
2. If local data is missing, fetch backend data using `attemptId` and `clientId`.
3. If backend data is found, optionally cache it back to localStorage.
4. If neither source has data, show the current empty/not-found states.

Affected screens:

- `/results`
- `/results?attemptId=...`
- `/results/[attemptId]/review`
- `/dashboard`

Exit criteria:

- A user can refresh or revisit in the same browser and see local data immediately.
- A user with cleared localStorage can recover a submitted attempt if they still have the same `clientId`.
- Existing no-DB local development behavior still works.

## Phase 4: Analytics and Reporting Readiness

Target: Make persisted data useful for product and question-quality decisions.

Tasks:

- Add internal aggregate queries for:
  - completion rate
  - average readiness score
  - most missed topics
  - most missed questions
  - high time-spent questions
  - unanswered/drop-off patterns
- Decide whether `AnalyticsEvent` should be written directly or remain future-only.
- Add a simple admin-only script for CSV export.
- Document safe manual queries for Supabase SQL editor.

Exit criteria:

- Team can identify weak questions and topic gaps without inspecting raw database rows manually.
- Analytics queries do not expose email addresses or unnecessary personal data.

## Phase 5: Account Persistence Decision

Target: Decide whether persistence should remain anonymous or become account-backed.

Options:

- Stay anonymous:
  - simpler MVP
  - no auth surface
  - limited cross-device recovery
- Add optional accounts:
  - cross-device history
  - more durable study plans
  - higher security and privacy burden

Planning questions:

- Is cross-device progress required before launch?
- Should waitlist email become a login identity?
- Should Supabase auth helpers stay, be removed, or be fully wired?
- What data should a student be able to delete?

Exit criteria:

- Clear product decision documented before auth code is introduced into user flows.

## Phase 6: Production Operations

Target: Make backend persistence safe enough for real traffic.

Tasks:

- Configure production `DATABASE_URL` and `DIRECT_URL`.
- Run migrations in production.
- Run `scripts/verify-prisma.ts` against production.
- Add rate limiting or abuse protection for:
  - `/api/waitlist`
  - `/api/session`
  - `/api/mock-attempt`
- Add monitoring for route error rates.
- Add a backup/export procedure for Supabase.
- Document data retention and deletion flow.

Exit criteria:

- Production deploy can write and read persisted attempts.
- Backend failures are visible.
- User-facing exam flow still works during DB failures.

## Priority Order

1. Harden existing write APIs.
2. Add backend read APIs for mock attempts.
3. Wire local-first fallback into results, review, and dashboard.
4. Add backend route tests.
5. Add operational checks and production DB verification.
6. Decide on anonymous-only versus account-backed persistence.

## Open Risks

- Current persisted attempts do not include every field needed to recreate `MockExamResult` without combining DB rows and source question data.
- Anonymous `clientId` is convenient but not secure authentication.
- Existing Supabase auth helpers are unused and can create confusion unless removed or intentionally adopted.
- Backend writes are currently best-effort and invisible to users when they fail.
- No route tests currently protect API behavior.

## Near-Term Implementation Checklist

- [ ] Create shared API validation utilities.
- [ ] Add tests for all existing API routes.
- [ ] Add `GET /api/mock-attempt/:attemptId`.
- [ ] Add `GET /api/mock-attempts`.
- [ ] Update results page to fetch backend fallback.
- [ ] Update review page to fetch backend fallback.
- [ ] Update dashboard to fetch backend fallback.
- [ ] Add production DB verification steps to the README.
- [ ] Decide whether to remove or wire Supabase auth helpers.
