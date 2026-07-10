import { describe, expect, it } from "vitest";
import {
  validateMockAttemptPayload,
  validateSessionPayload,
  validateWaitlistPayload,
} from "@/lib/api/persistence";

const now = Date.now();

const score = {
  module: "math",
  name: "Math",
  correct: 1,
  total: 1,
  answered: 1,
  unanswered: 0,
  accuracy: 100,
  weightedCorrect: 1,
  weightedTotal: 1,
  weightedAccuracy: 100,
  level: "strong",
  topics: [
    {
      module: "math",
      topic: "Algebra",
      correct: 1,
      total: 1,
      accuracy: 100,
      level: "strong",
    },
  ],
};

function validMockPayload() {
  return {
    clientId: "client-1",
    attempt: {
      attemptId: "attempt-1",
      status: "submitted",
      startedAt: now - 60_000,
      submittedAt: now,
      remainingSeconds: 0,
      answers: { "math-1": "a" },
      flaggedQuestionIds: [],
      questionTimeSpentSeconds: { "math-1": 60 },
      sectionOrder: ["math"],
      questionIdsBySection: { math: ["math-1"] },
      bankId: "upcat-core",
    },
    result: {
      attemptId: "attempt-1",
      startedAt: now - 60_000,
      submittedAt: now,
      durationSeconds: 60,
      remainingSeconds: 0,
      modules: [score],
      overall: {
        correct: 1,
        total: 1,
        answered: 1,
        unanswered: 0,
        accuracy: 100,
        weightedCorrect: 1,
        weightedTotal: 1,
        weightedAccuracy: 100,
        readinessScore: 100,
        level: "strong",
      },
      questionReviews: [
        {
          questionId: "math-1",
          module: "math",
          topic: "Algebra",
          difficulty: "easy",
          selectedAnswer: "a",
          correctAnswer: "a",
          isAnswered: true,
          isCorrect: true,
          isFlagged: false,
          timeSpentSeconds: 60,
        },
      ],
    },
  };
}

describe("persistence payload validation", () => {
  it("normalizes valid waitlist data", () => {
    const result = validateWaitlistPayload({
      email: " STUDENT@EXAMPLE.COM ",
      gradeLevel: " Grade 12 ",
    });

    expect(result).toEqual({
      value: {
        email: "student@example.com",
        gradeLevel: "Grade 12",
        targetYear: null,
        paidInterest: false,
        referralSource: null,
      },
    });
  });

  it("rejects answer choices outside the supported set", () => {
    const result = validateSessionPayload({
      clientId: "client-1",
      module: "math",
      answers: { "math-1": "e" },
      score,
      durationMs: 30_000,
    });

    expect(result).toHaveProperty("error");
  });

  it("accepts a complete submitted mock payload", () => {
    expect(validateMockAttemptPayload(validMockPayload())).toHaveProperty("value");
  });

  it("rejects a result tied to a different attempt", () => {
    const payload = validMockPayload();
    payload.result.attemptId = "attempt-2";

    expect(validateMockAttemptPayload(payload)).toHaveProperty("error");
  });
});
