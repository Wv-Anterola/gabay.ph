import { describe, expect, it } from "vitest";
import { buildBanks, parseQuestionFile } from "./import-questions";

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
});
