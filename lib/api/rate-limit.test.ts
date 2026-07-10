import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitsForTests } from "@/lib/api/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
  });

  it("limits requests independently by endpoint and client", () => {
    const request = new Request("https://tero.test/api/session", {
      headers: { "x-forwarded-for": "203.0.113.1" },
    });

    expect(checkRateLimit(request, "session", { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit(request, "session", { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit(request, "session", { limit: 2, windowMs: 60_000 }).allowed).toBe(false);
    expect(checkRateLimit(request, "waitlist", { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
  });
});
