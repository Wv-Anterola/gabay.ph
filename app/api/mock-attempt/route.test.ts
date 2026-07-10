import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitsForTests } from "@/lib/api/rate-limit";

const db = vi.hoisted(() => ({
  configured: false,
  prisma: null as any,
}));

vi.mock("@/lib/db", () => ({
  get prisma() {
    return db.prisma;
  },
  isDbConfigured: () => db.configured,
}));

import { POST } from "./route";

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
  topics: [],
};

function validPayload() {
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

function request(body: unknown): Request {
  return new Request("https://tero.test/api/mock-attempt", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.4" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/mock-attempt", () => {
  beforeEach(() => {
    db.configured = false;
    db.prisma = null;
    resetRateLimitsForTests();
  });

  it("keeps submitted results local when no database is configured", async () => {
    const response = await POST(request(validPayload()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      persisted: false,
      error: "database_unavailable",
    });
  });

  it("rejects mismatched attempt and result identifiers", async () => {
    const payload = validPayload();
    payload.result.attemptId = "attempt-2";

    const response = await POST(request(payload));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: "invalid_payload" });
  });

  it("writes the attempt and responses inside one transaction", async () => {
    const upsert = vi.fn();
    const deleteMany = vi.fn();
    const createMany = vi.fn();
    const transaction = vi.fn(async (callback) =>
      callback({
        mockAttempt: { upsert },
        mockQuestionResponse: { deleteMany, createMany },
      }),
    );
    db.configured = true;
    db.prisma = { $transaction: transaction };

    const response = await POST(request(validPayload()));

    expect(response.status).toBe(201);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(deleteMany).toHaveBeenCalledWith({ where: { attemptId: "attempt-1" } });
    expect(createMany).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      persisted: true,
      id: "attempt-1",
    });
  });
});
