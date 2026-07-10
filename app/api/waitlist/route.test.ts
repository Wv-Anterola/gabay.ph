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

function request(body: unknown): Request {
  return new Request("https://tero.test/api/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.2" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    db.configured = false;
    db.prisma = null;
    resetRateLimitsForTests();
  });

  it("returns a structured response when the database is unavailable", async () => {
    const response = await POST(request({ email: "student@example.com" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      persisted: false,
      error: "database_unavailable",
    });
  });

  it("rejects malformed JSON before writing", async () => {
    const response = await POST(request("{"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "invalid_json" });
  });

  it("normalizes and persists a valid signup", async () => {
    const upsert = vi.fn().mockResolvedValue({ id: "signup-1" });
    db.configured = true;
    db.prisma = { waitlistSignup: { upsert } };

    const response = await POST(request({ email: " STUDENT@EXAMPLE.COM " }));

    expect(response.status).toBe(201);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "student@example.com" } }),
    );
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      persisted: true,
      id: "signup-1",
    });
  });
});
