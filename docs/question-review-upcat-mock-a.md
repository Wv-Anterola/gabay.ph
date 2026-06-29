# Question Review — `upcat-mock-a`

Manual review of all 53 questions (53 read). Grouped by severity. Each item lists the question
`id`, the issue, and a suggested change. Nothing here has been auto-applied — these are flags for
your decision.

**Summary:** 2 questions are effectively broken (missing figures), ~6 have a debatable answer key or
ambiguity worth fixing, and the rest are sound with minor wording polish suggested.

---

## 🔴 High — broken / unsolvable as written

### `math-007` (Parallel Lines & Angles)
References "a figure" that isn't included, and the explanation hand-waves the result
("Through careful geometric tracing… we find that x = 75°"). A student cannot solve this from the
text alone. **Fix:** add the actual figure as an image, or replace with a self-contained question.

### `math-008` (Area & Similarity)
References "the figure" with points `G`, `F`, `E` that are never defined, and the step "square side =
GC = 6" only follows from a diagram. Unsolvable / ambiguous without it. **Fix:** add the figure, or
replace.

---

## 🟠 Medium — debatable answer key or ambiguity

### `lang-005` (Idioms — "against the grain") — answer key questionable
Keyed **D ("It is irritating")**, but **C ("It is contrary to custom")** is closer to the standard
dictionary meaning of "against the grain" (contrary to one's nature/inclination). The explanation
itself says "contrary to one's natural inclination," which points at C, not D. **Fix:** re-key to C,
or rewrite the distractors so only one is defensible.

### `lang-007` (Grammar — indirect question) — two correct answers
Keyed **C ("…whether you won…")**, but **D ("…if you won the first prize.")** is *also* grammatically
correct (informal "if" for an indirect question is standard). Two valid answers. **Fix:** change
distractor D so it contains an actual error (e.g. a tense slip).

### `math-012` (Deductive Reasoning) — ambiguous wording
Asks which statement is "not consistent." Strictly, **C ("No mascot is a clown")** *is* logically
consistent with the premises — it just isn't *entailed*. The intended meaning is "cannot be
concluded." **Fix:** reword the stem to "Which cannot be validly concluded?" so C is unambiguously
the answer.

### `read-009` (Filipino — "iba't ibang katawagan") — answer key questionable
Keyed **C ("maraming lugar")**, but the different names (haribon, manaol, garuda, malabagook) come
from different language groups, so **B ("maraming wika sa Pilipinas")** is arguably the stronger
inference. **Fix:** reconsider key (likely B), or tighten the distractors.

### `sci-008` (Chemical Bonding) — missing figure + answer given away
Says "Assume images of 4 molecular structures," but the choices literally read "Structure C (contains
a double bond)" — so the answer is handed to the student. **Fix:** supply real structures as an
image, or name concrete molecules (e.g. O₂, N₂, H₂, CH₄) and ask which has a π bond.

### `math-001` — mislabeled topic
Topic is "Sequences & Series," but the question is scientific-notation arithmetic. The math/answer
(C, 0.00458) is correct. **Fix:** change topic to "Scientific Notation" / "Number Sense."

---

## 🟡 Low — wording / style polish (answers are fine)

- **"Assume a graph/figure…" stems** (`math-009`, `sci-004`, `sci-010`, `sci-015`): adapted from
  figure-based items. They embed enough data in the text to be answerable, but read awkwardly. Ideal:
  add the real figure or rephrase to "The table below shows…".
- **`lang-001`**: the fill-in ("…and ___ to say words we do not mean") is clunky; "manage to" is a
  stretch. Consider rephrasing the stem or distractors.
- **`lang-003`**: distractor "a piece of sterile glove" is unidiomatic (a/pair of glove(s)); fine as a
  distractor but slightly distracting from the intended error (A, "requested for").
- **`sci-002`**: "aligned vertically at the center" — chromosomes align at the equatorial/metaphase
  plate; "vertically" is imprecise. Answer (B) is correct.
- **`sci-007`**: spelling "homogenous" → "homogeneous." Answer (B) is correct.
- **`math-003`**: answer presented as "30/4" (= 7.5) while other options are whole/unit fractions;
  consider showing "7.5". Correct as keyed (A).

## Reading-comprehension subjectivity (acceptable, noted)
Reading items naturally allow a defensible second choice. The most debatable is **`read-007`**
("what does the poet accomplish") where C, A, and D are all arguable — consider tightening. Minor
A-vs-D / B-vs-D tension also exists in `read-002`, `read-004`, `read-005`, `read-008`; these are
within normal reading-comp tolerance.

---

## Suggested next step
Fix the two 🔴 items first (they're unanswerable). The 🟠 items are quick edits to a `.md` file
(re-key or adjust a distractor); after editing, run `npm run questions:import`. If you want, I can
apply the 🟠 + 🟡 edits in one pass for your review.
