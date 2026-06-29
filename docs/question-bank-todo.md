# Question Bank — TODO & Cleanup Plan

Tracks issues surfaced while importing `upcat-mock-a` and making it the live exam.

**Legend:** ✅ done · 🔲 open · 🔄 in progress · ⚪ optional

Live exam bank: **`upcat-mock-a`** (53 approved questions). Set by `ACTIVE_BANK_ID` in
[`lib/questions/index.ts`](../lib/questions/index.ts).

---

## 1. 🔲 Human content review of `upcat-mock-a` (HIGH — do before sharing publicly)

**Problem:** All 53 questions were approved mechanically (`npm run questions:approve`) and went live
**without anyone reading them**. They're AI-generated, so answer keys, distractors, and explanations
are unverified. This is what students will actually see.

**Plan:**
1. Run the automated lint first (see item 2) to catch mechanical errors.
2. Read every question in [`question-bank/upcat-mock-a/`](../question-bank/upcat-mock-a):
   `language.md`, `math.md`, `science.md`, `read-psg-001…004.md`.
3. For each, verify: the `answer` key is correct; the other 3 choices are clearly wrong; the
   explanation matches the answer; math is solvable and unambiguous; passage questions are
   answerable from the passage.
4. To pull a bad question while fixing it, set `review_status: needs_review` (or `rejected`) in its
   `.md` block, then `npm run questions:import` — it stops being served immediately.
5. After fixes, `npm run questions:approve upcat-mock-a` to re-approve and regenerate.

**Done when:** every question has been read by a human, and no `rejected`/`needs_review` items
remain in the served bank.

---

## 2. 🔲 Add an automated question-quality linter (MEDIUM — speeds up item 1)

**Problem:** The importer validates *structure* (4 choices, valid answer key, required sections) but
not *quality*. Mechanical mistakes slip through.

**Plan:** Add `scripts/lint-questions.ts` + `npm run questions:lint <bank>` that flags:
- duplicate or near-duplicate choice text within a question
- duplicate question stems across the bank
- explanation that doesn't mention the answer letter/text
- suspiciously short stems/explanations
- `passage_id` referenced by a question but not defined in any bank
- answer-letter distribution skew (e.g. 40% are "A") as a soft warning

Report-only (non-destructive); exit non-zero if hard issues found so it can gate CI later.

**Done when:** `npm run questions:lint upcat-mock-a` runs clean (or only soft warnings remain).

---

## 3. ⚪ Auto-normalize content on import (LOW — prevents recurrence)

**Problem:** Source had `\_\_\_\_\_\_` (escaped underscores) that rendered with visible backslashes.
Fixed manually this time.

**Plan:** In `scripts/import-questions.ts`, normalize common authoring artifacts when reading a stem:
collapse `\_` → `_`, normalize smart quotes if they cause issues, trim trailing spaces. Add a unit
test in `scripts/import-questions.test.ts`.

**Done when:** importing a file containing `\_` produces clean output with no manual step.

---

## 4. ✅ Malformed filenames — FIXED

Files were named with their entire frontmatter block (newlines + colons), which breaks git/shell
tooling. Renamed to `language.md`, `math.md`, `science.md`, `read-psg-001…004.md`.

**Prevention (process):** generate to a single file, then use
`npm run questions:add <bank> <file.md>` instead of hand-creating files. Document this as the
standard path (already in the question-bank README).

---

## 5. ✅ Escaped fill-in-the-blank underscores — FIXED

Normalized `\_\_\_\_\_\_` → plain blanks across the bank and re-imported. (Item 3 makes this
automatic going forward.)

---

## 6. ⚪ Bank size & coverage (LOW — product decision)

**Observation:** `upcat-mock-a` has 53 questions (Language 10 · Reading 16 · Math 12 · Science 15).
The legacy `core` pool has ~315. Decide whether 53 is enough for a "full mock," and whether to top
up weak sections (Language/Math are thinnest).

**Plan:** Decide target counts per section → generate the gap with Manus → `questions:add` →
review → approve.

---

## 7. ⚪ Serving strategy: single bank vs. picker (LOW — future)

Currently one bank is live via `ACTIVE_BANK_ID`. If multiple mocks are wanted, build a bank picker
on `/diagnostic` (or random-bank-per-attempt) so `core` and future banks can be offered. The
registry seam (`listBanks()`, `getBank()`, attempt `bankId`) is already in place.

---

## Quick command reference

```bash
npm run questions:add <bank> <file.md>   # add a Markdown blob to a bank (validates)
npm run questions:import                 # regenerate lib/questions/imported.ts
npm run questions:approve <bank>         # approve all of a bank, then re-import
npm test                                 # parsing/validation tests
```
