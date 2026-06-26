# Tero.ph MVP PRD

## Goal
Ship a polished, free online UPCAT mock exam that students can complete from start to finish at **tero.ph**.

## MVP Success Criteria
A first-time visitor can open the website, start the mock exam, complete all sections, submit,
receive an accurate readiness score, review every missed answer with explanations, and retake the
mock exam if desired.

## Already Built and Kept in MVP
- Landing page, navigation, privacy/disclaimer pages, and waitlist capture.
- Diagnostic UI primitives: question cards, choices, progress rail, submit confirmation, and local persistence.
- Existing approved question bank across Language, Reading, Mathematics, and Science.
- Basic scoring, readiness levels, weak-topic reporting, 7-day study plan, and weak-topic practice.
- Prisma persistence foundation and GA analytics wrapper.

## Required MVP Behavior
- `/diagnostic` is the full mock exam start/resume screen.
- `/diagnostic/exam` runs one full mock across Language, Reading, Mathematics, and Science.
- The exam persists selected answers, current section, current question, remaining time, flagged
  questions, per-question time spent, and completion status.
- Refreshing the browser resumes an unfinished attempt.
- Submission calculates raw score, weighted score, section scores, and readiness score.
- `/results` shows the latest attempt summary and links to review, retake, and dashboard.
- `/results/[attemptId]/review` shows every question with the student answer, correct answer,
  explanation, topic, difficulty, flag status, and time spent.
- `/dashboard` shows previous attempts, retake, and view-results actions.

## Question Data and Import
- Runtime questions remain versioned source files for MVP reliability.
- Markdown reviewer files live under `question-bank/`.
- `npm run questions:import` validates Markdown and generates source-controlled question data.
- No manual editing inside the database.
- Database stores mock attempts, per-question responses, and analytics-ready timing/correctness data.

## In Scope Add-ons
The existing study plan, weak-topic practice, and waitlist remain visible as MVP add-ons after
results. They must not block the core mock exam flow.

## Out of Scope for MVP
AI tutor, adaptive learning, streaks, benchmarks, percentiles, referrals, community features,
paid accounts, and live database-served question delivery.

## Definition of Done
The MVP is ready for public testing when the complete exam path works on desktop and mobile, Vercel
builds successfully, DB-less local usage still works, and submitted attempts can be reviewed or
retaken without data loss.
