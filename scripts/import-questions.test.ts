import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildBanks, importQuestions, parseQuestionFile } from "./import-questions";

const SINGLE = `---
id: q-001
section: math
topic: Algebra
difficulty: medium
answer: b
estimated_time: 60
---

## Question
What is $x$ if $2x + 3 = 11$?

## Choices
A. 3
B. 4
C. 5
D. 6

## Explanation
Subtract 3, divide by 2.
`;

const SET = `---
bank: upcat-mock-a
section: reading
passage_id: psg-coral
passage_title: The Coral Gardeners
---

## Passage
A long passage about coral restoration.

===

---
id: r-001
topic: Main Idea
difficulty: medium
answer: c
estimated_time: 60
---

## Question
What is the main idea?

## Choices
A. one
B. two
C. three
D. four

## Explanation
Because three.

===

---
id: r-002
topic: Inference
difficulty: hard
answer: a
estimated_time: 75
---

## Question
What can be inferred?

## Choices
A. one
B. two
C. three
D. four

## Explanation
Because one.
`;

const WITH_DIAGRAM = SINGLE.replace(
  "estimated_time: 60",
  "estimated_time: 60\ndiagram_alt: A rectangle labeled 8 by 5.",
).replace(
  "## Explanation\nSubtract 3, divide by 2.",
  `## Explanation
Subtract 3, divide by 2.

## Diagram
{
  "kind": "rectangle-area",
  "widthLabel": "8",
  "heightLabel": "5"
}`,
);

describe("parseQuestionFile", () => {
  it("parses a single question and defaults to the folder bank id", () => {
    const { questions, passages } = parseQuestionFile(SINGLE, "q-001.md", "upcat-core");
    expect(passages).toHaveLength(0);
    expect(questions).toHaveLength(1);
    expect(questions[0]).toMatchObject({
      id: "q-001",
      section: "math",
      answer: "b",
      bankId: "upcat-core",
      reviewStatus: "needs_review",
    });
    expect(questions[0].choices).toHaveLength(4);
  });

  it("honors an explicit review_status and a set header's review_status", () => {
    const approved = SINGLE.replace("answer: b", "answer: b\nreview_status: approved");
    expect(parseQuestionFile(approved, "q.md").questions[0].reviewStatus).toBe("approved");

    const approvedSet = SET.replace(
      "passage_title: The Coral Gardeners",
      "passage_title: The Coral Gardeners\nreview_status: approved",
    );
    const { questions } = parseQuestionFile(approvedSet, "set.md");
    expect(questions.every((q) => q.reviewStatus === "approved")).toBe(true);
  });

  it("frontmatter bank overrides the folder bank id", () => {
    const withBank = SINGLE.replace("section: math", "bank: Custom Bank\nsection: math");
    const { questions } = parseQuestionFile(withBank, "q.md", "folder-bank");
    expect(questions[0].bankId).toBe("custom-bank");
  });

  it("parses a passage set and inherits header bank/section/passage", () => {
    const { questions, passages } = parseQuestionFile(SET, "set.md", "folder");
    expect(passages).toEqual([
      {
        id: "psg-coral",
        title: "The Coral Gardeners",
        body: "A long passage about coral restoration.",
        bankId: "upcat-mock-a",
      },
    ]);
    expect(questions).toHaveLength(2);
    for (const q of questions) {
      expect(q.section).toBe("reading");
      expect(q.bankId).toBe("upcat-mock-a");
      expect(q.passageId).toBe("psg-coral");
    }
  });

  it("rejects a passage header without a passage_id", () => {
    const bad = SET.replace("passage_id: psg-coral\n", "");
    expect(() => parseQuestionFile(bad, "set.md")).toThrow(/passage_id/);
  });

  it("rejects an invalid answer key", () => {
    const bad = SINGLE.replace("answer: b", "answer: z");
    expect(() => parseQuestionFile(bad, "q.md")).toThrow(/invalid answer/);
  });

  it("rejects an image without alt text", () => {
    const bad = SINGLE.replace(
      "estimated_time: 60",
      "estimated_time: 60\nimage_src: /x.png",
    );
    expect(() => parseQuestionFile(bad, "q.md")).toThrow(/image_alt/);
  });

  it("parses a Diagram block without affecting the question sections", () => {
    const { questions } = parseQuestionFile(WITH_DIAGRAM, "q.md", "math-bank");
    expect(questions[0].question).toBe("What is $x$ if $2x + 3 = 11$?");
    expect(questions[0].explanation).toBe("Subtract 3, divide by 2.");
    expect(questions[0].diagram).toMatchObject({ kind: "rectangle-area" });
    expect(questions[0].image).toEqual({
      src: "/questions/math-bank/q-001.svg",
      alt: "A rectangle labeled 8 by 5.",
      caption: undefined,
    });
  });

  it("rejects a Diagram block without alt text", () => {
    const bad = WITH_DIAGRAM.replace("diagram_alt: A rectangle labeled 8 by 5.\n", "");
    expect(() => parseQuestionFile(bad, "q.md")).toThrow(/diagram_alt/);
  });

  it("rejects an unknown Diagram kind", () => {
    const bad = WITH_DIAGRAM.replace('"kind": "rectangle-area"', '"kind": "raw-svg"');
    expect(() => parseQuestionFile(bad, "q.md")).toThrow(/unknown diagram kind/);
  });
});

describe("buildBanks", () => {
  it("groups questions and passages into banks", () => {
    const banks = buildBanks([
      { path: "core/q-001.md", source: SINGLE, folderBankId: "upcat-core" },
      { path: "a/set.md", source: SET, folderBankId: "a" },
    ]);
    expect(banks.map((b) => b.id)).toEqual(["upcat-core", "upcat-mock-a"]);
    const mockA = banks.find((b) => b.id === "upcat-mock-a")!;
    expect(mockA.questions).toHaveLength(2);
    expect(mockA.passages).toHaveLength(1);
    expect(mockA.questions[0]).toMatchObject({
      module: "reading",
      bankId: "upcat-mock-a",
      sourceType: "original_generated",
    });
  });

  it("throws on duplicate question ids across files", () => {
    expect(() =>
      buildBanks([
        { path: "a.md", source: SINGLE, folderBankId: "x" },
        { path: "b.md", source: SINGLE, folderBankId: "y" },
      ]),
    ).toThrow(/duplicate id q-001/);
  });

  it("picks up bank_name metadata", () => {
    const named = SINGLE.replace(
      "section: math",
      "bank: x\nbank_name: Fancy Bank\nsection: math",
    );
    const banks = buildBanks([{ path: "a.md", source: named, folderBankId: "x" }]);
    expect(banks[0]).toMatchObject({ id: "x", name: "Fancy Bank" });
  });

  it("generates svg assets for imported Diagram blocks", () => {
    const root = join(tmpdir(), `question-import-${Date.now()}`);
    const inputDir = join(root, "question-bank");
    const bankDir = join(inputDir, "math-bank");
    const outputFile = join(root, "imported.ts");
    const assetOutputDir = join(root, "public", "questions");
    mkdirSync(bankDir, { recursive: true });
    writeFileSync(join(bankDir, "math.md"), WITH_DIAGRAM);

    const banks = importQuestions(inputDir, outputFile, {
      assetOutputDir,
      includeCoreDiagrams: false,
    });

    const svgPath = join(assetOutputDir, "math-bank", "q-001.svg");
    expect(banks[0].questions[0].image?.src).toBe("/questions/math-bank/q-001.svg");
    expect(existsSync(svgPath)).toBe(true);
    expect(readFileSync(svgPath, "utf8")).toContain("<svg");
  });
});
