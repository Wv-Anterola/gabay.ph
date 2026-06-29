import { describe, expect, it } from "vitest";
import { approveFileContent } from "./approve-questions";
import { parseQuestionFile } from "./import-questions";

const NEEDS_REVIEW = `---
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

describe("approveFileContent", () => {
  it("adds review_status: approved when missing", () => {
    const out = approveFileContent(NEEDS_REVIEW);
    expect(out).toMatch(/review_status: approved/);
    expect(parseQuestionFile(out, "q.md").questions[0].reviewStatus).toBe("approved");
  });

  it("flips an existing needs_review to approved", () => {
    const withStatus = NEEDS_REVIEW.replace(
      "answer: b",
      "answer: b\nreview_status: needs_review",
    );
    const out = approveFileContent(withStatus);
    expect(out).not.toMatch(/needs_review/);
    expect(parseQuestionFile(out, "q.md").questions[0].reviewStatus).toBe("approved");
  });

  it("approves every block in a multi-question file", () => {
    const two = `${NEEDS_REVIEW}\n===\n${NEEDS_REVIEW.replace("id: q-001", "id: q-002")}`;
    const out = approveFileContent(two);
    const { questions } = parseQuestionFile(out, "batch.md");
    expect(questions).toHaveLength(2);
    expect(questions.every((q) => q.reviewStatus === "approved")).toBe(true);
  });
});
