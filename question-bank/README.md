# Tero Question Import Format

Runtime questions are served from versioned source files. Author questions in Markdown (e.g. with
an AI like Manus), drop the files anywhere under `question-bank/`, then run:

```bash
npm run questions:import
# or point at a custom folder / output:
npx tsx scripts/import-questions.ts <input-dir> <output-file>
```

This generates `lib/questions/imported.ts`, which is wired into the bank registry in
`lib/questions/index.ts`. The exam currently serves the preset **"core"** bank; imported banks are
available through the registry so additional mocks can be served later.

## Copy-paste prompt for generating questions

Paste the block below into any AI (Manus, Claude, etc.). **Edit only the first line (`TASK:`)** to
say what you want — the rest is the strict output contract. Add your own context (topic lists,
difficulty mix, sample passages, syllabus, etc.) right under the `TASK:` line; the more context you
give, the better the questions.

> ````text
> TASK: <-- EDIT THIS LINE. Examples:
>   • "Generate 30 Mathematics questions covering algebra, geometry, and word problems."
>   • "Generate one Reading Comprehension passage set with 5 questions."
>   • "Generate a full mock: 4 separate documents, one per section (language, reading, math, science)."
>   • "Generate 15 Science questions, difficulty mix 5 easy / 7 medium / 3 hard."
> (Add any extra context below this line: topics, sample style, syllabus, etc.)
>
> OUTPUT CONTRACT — follow exactly:
> - Output Markdown only. No commentary before or after.
> - If I asked for multiple sections/documents, output each as its own fenced ```md block and label
>   it with a filename comment like `<!-- file: math.md -->` on the line above the block.
> - section must be one of: language | reading | math | science.
> - Separate every question with a line containing only: ===
> - Every `id` must be globally unique (prefix with the section, e.g. math-001, read-001).
> - Every question needs exactly 4 choices A–D; `answer` must be one of a|b|c|d.
> - Always include a `## Explanation`.
> - Wrap math in $...$.
>
> FORMAT — standalone question:
> ```md
> ---
> id: math-001
> section: math
> topic: Algebra
> difficulty: medium        # easy | medium | hard
> answer: b
> estimated_time: 60        # seconds
> ---
>
> ## Question
> What is $x$ if $2x + 3 = 11$?
>
> ## Choices
> A. 3
> B. 4
> C. 5
> D. 6
>
> ## Explanation
> Subtract 3, then divide by 2.
> ```
>
> FORMAT — reading set (one passage, many questions); the header has no `## Question`,
> and each following question inherits the header's section + passage_id:
> ```md
> ---
> section: reading
> passage_id: read-psg-001
> passage_title: The Coral Gardeners
> ---
>
> ## Passage
> <passage text>
>
> ===
>
> ---
> id: read-001
> topic: Main Idea
> difficulty: medium
> answer: c
> estimated_time: 60
> ---
>
> ## Question
> ...
>
> ## Choices
> A. ...
> B. ...
> C. ...
> D. ...
>
> ## Explanation
> ...
> ```
> ````

Then save each document to a `.md` file and run `npm run questions:add <bank> <file.md>` (below).
Keep separate reading passages in separate files, and put each section in its own file.

## Quick add (paste once, no manual files)

To drop a whole batch in one go, save what the AI gives you to a temp file and run:

```bash
npm run questions:add <bank> <source.md> [dest-name]
# e.g. npm run questions:add upcat-mock-a ./from-manus.md
```

This validates the blob (a wrapping ```` ```md ```` fence is stripped automatically), copies it into
`question-bank/<bank>/`, and regenerates the bank source. If anything is malformed, **nothing is
added** and you get the exact error. Note: one file is either all standalone questions
(`===`-separated) **or** one passage set — keep separate reading passages in separate files.

## Review gate

Imported questions default to **`review_status: needs_review`**, which means they are stored but
**not served** until approved. The fastest way to approve a whole bank:

```bash
npm run questions:approve <bank>
# e.g. npm run questions:approve upcat-mock-a
```

This sets `review_status: approved` on every question in that bank's files and re-imports. To
approve selectively instead, set `review_status: approved` on a single question (or in a set header
to approve the whole set) and re-run `npm run questions:import`:

```md
---
id: math-001
review_status: approved
...
---
```

The preset "core" bank is unaffected by this gate.

## Which bank the exam serves

The exam serves the bank named by `ACTIVE_BANK_ID` in `lib/questions/index.ts` (currently
`upcat-mock-a`). Change that one line to switch which mock is live. If the active bank is missing or
has no approved questions yet, the exam automatically falls back to the preset `core` bank so it is
never empty. Module/question counts shown in the UI reflect the active bank.

## Question banks

Every question belongs to a **bank** (one bank = one self-contained mock). The bank id is resolved
in this order:

1. `bank:` in the file's frontmatter, else
2. the **top-level folder** under `question-bank/` (e.g. `question-bank/upcat-mock-a/...` → bank
   `upcat-mock-a`), else
3. `default`.

Optionally set a friendly `bank_name:` and `bank_description:` in any file's frontmatter to label
the bank in listings.

## Two file shapes

### 1. Single question (supports an image)

One question per file:

```md
---
id: math-algebra-001
bank: upcat-mock-a            # optional; folder name is used if omitted
section: math                # language | reading | math | science
topic: Algebra
subtopic: Linear equations   # optional
difficulty: medium           # easy | medium | hard
answer: b                    # a | b | c | d
estimated_time: 60           # seconds, positive number
tags: equations, solving     # optional, comma-separated
review_status: approved      # optional; approved | needs_review | rejected (default needs_review)
image_src: /questions/triangle.png   # optional
image_alt: A right triangle with legs 3 and 4   # required when image_src is set
image_caption: Figure 1      # optional
# OR use generated SVG diagrams:
diagram_alt: A right triangle with legs 3 and 4   # required when ## Diagram is set
diagram_caption: Figure 1      # optional
---

## Question
What is the value of $x$ if $2x + 3 = 11$?

## Choices
A. 3
B. 4
C. 5
D. 6

## Explanation
Subtract 3 from both sides, then divide by 2.
```

You may also batch several standalone questions in one file by separating each block with a line
that is exactly `===`.

### Generated SVG diagrams

For math items that need a figure, add a structured `## Diagram` JSON block. The importer validates
the template data, writes a static SVG to `public/questions/<bank>/<question-id>.svg`, and wires it
into the runtime question image automatically. Do not paste raw SVG into Markdown.

```md
---
id: math-geometry-001
section: math
topic: Parallel Lines & Angles
difficulty: medium
answer: b
estimated_time: 60
diagram_alt: Two parallel lines cut by a transversal with angles labeled 3x degrees and x plus 40 degrees.
diagram_caption: Same-side interior angles
---

## Question
Two parallel lines are cut by a transversal...

## Choices
A. ...
B. ...
C. ...
D. ...

## Explanation
Same-side interior angles are supplementary.

## Diagram
{
  "kind": "parallel-lines-transversal",
  "labels": {
    "angleA": "3x°",
    "angleB": "x + 40°"
  }
}
```

Supported v1 `kind` values are `coordinate-line-points`, `circle-inscribed-angle`,
`parallel-lines-transversal`, `similar-triangles`, `grouped-bar-chart`, `two-way-table`,
`combination-slots`, `venn-syllogism`, `rectangle-area`, `triangle-angle-sum`, `right-triangle`,
`ratio-parts`, and `marble-bag`.

### 2. Question set (one shared passage, many questions)

Use this for reading comprehension. The **first block** is a passage header (has `## Passage` and
no `## Question`); each following block (separated by `===`) is a question that **inherits** the
header's `bank`, `section`, and `passage_id`:

```md
---
bank: upcat-mock-a
section: reading
passage_id: psg-coral
passage_title: The Coral Gardeners
---

## Passage
Off the coast of a small island, a group of fishers once dynamited reefs for a quick catch...

===

---
id: psg-coral-q1
topic: Main Idea
difficulty: medium
answer: b
estimated_time: 60
---

## Question
What is the main idea of the passage?

## Choices
A. ...
B. ...
C. ...
D. ...

## Explanation
...

===

---
id: psg-coral-q2
topic: Inference
difficulty: hard
answer: c
estimated_time: 75
---

## Question
...

## Choices
A. ...
B. ...
C. ...
D. ...

## Explanation
...
```

## Validation

Import fails for: duplicate question ids, duplicate passage ids, invalid section, invalid
difficulty, invalid/missing answer key, invalid `review_status`, missing answer choices, missing
`## Question` or `## Explanation` body, non-positive `estimated_time`, a passage set without a
`passage_id` or without question blocks, and images without `image_alt`.
