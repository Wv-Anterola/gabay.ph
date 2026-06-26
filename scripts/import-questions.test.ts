import { describe, expect, it } from "vitest";
import { parseQuestionFiles, parseQuestionMarkdown } from "./import-questions";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const VALID = `---
id: math-001
section: math
topic: Algebra
subtopic: Linear equations
difficulty: medium
answer: b
estimated_time: 60
---

## Question
Solve $2x = 8$.

## Choices
A. 2
B. 4
C. 6
D. 8

## Explanation
Divide both sides by 2.
`;

describe("parseQuestionMarkdown", () => {
  it("normalizes a valid Markdown question", () => {
    const q = parseQuestionMarkdown(VALID);
    expect(q.id).toBe("math-001");
    expect(q.section).toBe("math");
    expect(q.choices).toHaveLength(4);
    expect(q.estimated_time).toBe(60);
  });

  it("requires image alt text", () => {
    expect(() =>
      parseQuestionMarkdown(VALID.replace("estimated_time: 60", "estimated_time: 60\nimage_src: /x.png")),
    ).toThrow(/image_alt/);
  });

  it("rejects duplicate ids across files", () => {
    const dir = mkdtempSync(join(tmpdir(), "tero-import-"));
    const a = join(dir, "a.md");
    const b = join(dir, "b.md");
    writeFileSync(a, VALID);
    writeFileSync(b, VALID);
    expect(() => parseQuestionFiles([a, b])).toThrow(/duplicate id/);
  });
});
