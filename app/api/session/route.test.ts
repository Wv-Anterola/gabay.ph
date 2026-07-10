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

function request(body: unknown): Request {
  return new Request("https://tero.test/api/session", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.3" },
    body: JSON.stringify(body),
  });
}

function validPayload() {
  return {
    clientId: "client-1",
    module: "math",
    answers: { "math-1": "a" },
    score,
    durationMs: 30_000,
  };
}

describe("POST /api/session", () => {
  beforeEach(() => {
    db.configured = false;
    db.prisma = null;
    resetRateLimitsForTests();
  });

  it("keeps the local-first flow non-failing without a database", async () => {
    const response = await POST(request(validPayload()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      persisted: false,
      error: "database_unavailable",
    });
  });

  it("rejects unsupported answer choices", async () => {
    const payload = validPayload();
    payload.answers["math-1"] = "e";

    const response = await POST(request(payload));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: "invalid_payload" });
  });

  it("saves validated session data", async () => {
    const create = vi.fn().mockResolvedValue({ id: "session-1" });
    db.configured = true;
    db.prisma = { diagnosticSession: { create } };

    const response = await POST(request(validPayload()));

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ module: "math", clientId: "client-1" }),
      }),
    );
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      persisted: true,
      id: "session-1",
    });
  });
});
