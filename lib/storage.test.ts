import { describe, expect, it } from "vitest";
import { computeResumedRemainingSeconds } from "@/lib/storage";

describe("computeResumedRemainingSeconds", () => {
  it("subtracts elapsed time while preserving a zero floor", () => {
    expect(computeResumedRemainingSeconds(120, 1_000, 31_000)).toBe(90);
    expect(computeResumedRemainingSeconds(20, 1_000, 31_000)).toBe(0);
  });
});
