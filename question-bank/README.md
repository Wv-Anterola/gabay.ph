# Tero Question Import Format

Runtime questions are served from versioned source files. Use Markdown for drafting and review, then run:

```bash
npm run questions:import
```

Each question file should use this structure:

```md
---
id: math-algebra-001
section: math
topic: Algebra
subtopic: Linear equations
difficulty: medium
answer: b
estimated_time: 60
image_src:
image_alt:
image_caption:
---

## Passage
Optional shared passage text.

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

Validation fails for duplicate IDs, invalid sections, invalid difficulty, missing answer choices,
missing explanation, invalid answer keys, and images without alt text.
