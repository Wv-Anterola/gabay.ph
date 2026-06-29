import { describe, it, expect } from "vitest";
import {
  UPG_APPEAL_THRESHOLD,
  UPG_MAX,
  UPG_MIN,
  admissionStanding,
  deriveUpgDrivers,
  estimateUpg,
  hsAverageToUpg,
  nearestOfficialGpe,
  percentToGpe,
  readinessBandForUpg,
  upgConfidence,
  weightedScoreToUpg,
} from "@/lib/upg";
import type { ModuleScore } from "@/lib/types";

describe("weightedScoreToUpg", () => {
  it("maps weighted score linearly across the 1.00–5.00 scale", () => {
    expect(weightedScoreToUpg(0.9)).toBe(1.4);
    expect(weightedScoreToUpg(0.8)).toBe(1.8);
    expect(weightedScoreToUpg(0.7)).toBe(2.2);
    expect(weightedScoreToUpg(0.5)).toBe(3.0);
    expect(weightedScoreToUpg(0.25)).toBe(4.0); // chance level on 4-choice items
    expect(weightedScoreToUpg(0.1)).toBe(4.6);
  });

  it("clamps to [1.00, 5.00]", () => {
    expect(weightedScoreToUpg(1)).toBe(UPG_MIN);
    expect(weightedScoreToUpg(0)).toBe(UPG_MAX); // failing floor = 5.00
    expect(weightedScoreToUpg(1.5)).toBe(UPG_MIN);
    expect(weightedScoreToUpg(-0.5)).toBe(UPG_MAX);
  });
});

describe("readinessBandForUpg", () => {
  it("labels a continuous GPE with the nearest official description", () => {
    expect(readinessBandForUpg(1.0)).toBe("excellent");
    expect(readinessBandForUpg(1.25)).toBe("very_good");
    expect(readinessBandForUpg(1.75)).toBe("very_good");
    expect(readinessBandForUpg(2.0)).toBe("satisfactory");
    expect(readinessBandForUpg(2.5)).toBe("satisfactory");
    expect(readinessBandForUpg(2.75)).toBe("fair");
    expect(readinessBandForUpg(3.0)).toBe("fair");
    expect(readinessBandForUpg(3.5)).toBe("failed");
  });
});

describe("percentToGpe (official strict scale)", () => {
  it("maps equivalence percentages to the official grade + description", () => {
    expect(percentToGpe(100)).toEqual({ gpe: 1.0, description: "excellent" });
    expect(percentToGpe(95)).toEqual({ gpe: 1.25, description: "very_good" });
    expect(percentToGpe(86)).toEqual({ gpe: 2.0, description: "satisfactory" });
    expect(percentToGpe(75)).toEqual({ gpe: 3.0, description: "fair" });
    expect(percentToGpe(60)).toEqual({ gpe: 5.0, description: "failed" });
  });
});

describe("nearestOfficialGpe", () => {
  it("snaps a continuous estimate to a valid mark", () => {
    expect(nearestOfficialGpe(2.05)).toBe(2.0);
    expect(nearestOfficialGpe(2.2)).toBe(2.25);
    expect(nearestOfficialGpe(1.1)).toBe(1.0);
  });
});

describe("upgConfidence", () => {
  it("widens as completion drops", () => {
    expect(upgConfidence(1)).toBe("high");
    expect(upgConfidence(0.95)).toBe("high");
    expect(upgConfidence(0.85)).toBe("medium");
    expect(upgConfidence(0.8)).toBe("medium");
    expect(upgConfidence(0.6)).toBe("low");
    expect(upgConfidence(0)).toBe("low");
  });
});

describe("admissionStanding (appeal line at 2.8)", () => {
  it("is competitive when the whole range clears the appeal line", () => {
    expect(admissionStanding({ lowerBound: 2.45, upperBound: 2.7 })).toBe("competitive");
  });

  it("is appeal_range when the range straddles 2.8", () => {
    expect(admissionStanding({ lowerBound: 2.65, upperBound: 2.95 })).toBe("appeal_range");
    expect(admissionStanding({ lowerBound: UPG_APPEAL_THRESHOLD, upperBound: 3.1 })).toBe(
      "appeal_range",
    );
  });

  it("is below_threshold only when even the best-case bound is past 2.8", () => {
    expect(admissionStanding({ lowerBound: 2.95, upperBound: 3.4 })).toBe("below_threshold");
  });

  it("flows through estimateUpg", () => {
    // Strong, fully-completed attempt -> tight range, clearly competitive.
    expect(estimateUpg({ weightedScore: 0.7, completionRate: 1 }).admissionStanding).toBe(
      "competitive",
    );
    // Very weak attempt -> range sits past the appeal line.
    expect(estimateUpg({ weightedScore: 0.05, completionRate: 1 }).admissionStanding).toBe(
      "below_threshold",
    );
  });
});

describe("hsAverageToUpg", () => {
  it("maps HS percentage averages through the official scale", () => {
    expect(hsAverageToUpg(95)).toBe(1.25); // 94.50–97.49
    expect(hsAverageToUpg(90)).toBe(1.75); // 88.50–91.49
    expect(hsAverageToUpg(86)).toBe(2.0); // 85.50–88.49
  });
});

describe("estimateUpg HS blend (40% HS / 60% mock)", () => {
  it("blends the HS average with the mock estimate when provided", () => {
    // mock 0.5 -> 3.00; HS 95 -> 1.25; blend = 0.4*1.25 + 0.6*3.00 = 2.30
    const e = estimateUpg({ weightedScore: 0.5, completionRate: 1, hsAverage: 95 });
    expect(e.pointEstimate).toBe(2.3);
  });

  it("is mock-only when no HS average is given", () => {
    expect(estimateUpg({ weightedScore: 0.5, completionRate: 1 }).pointEstimate).toBe(3.0);
  });

  it("a strong HS average pulls a weak mock toward a better estimate", () => {
    const withHs = estimateUpg({ weightedScore: 0.2, completionRate: 1, hsAverage: 96 });
    const mockOnly = estimateUpg({ weightedScore: 0.2, completionRate: 1 });
    expect(withHs.pointEstimate).toBeLessThan(mockOnly.pointEstimate);
  });
});

describe("estimateUpg", () => {
  it("returns a clamped range whose width follows confidence", () => {
    const e = estimateUpg({ weightedScore: 0.6, completionRate: 1, dragSectionName: "Math" });
    expect(e.pointEstimate).toBe(2.6);
    expect(e.confidence).toBe("high");
    expect(e.lowerBound).toBe(2.46);
    expect(e.upperBound).toBe(2.74);
    expect(e.readinessBand).toBe("satisfactory");
    expect(e.explanation).toContain("Math");
  });

  it("uses a wider range for low completion", () => {
    // weightedScore 0.75 -> 2.00 so there is no performance-width term to add.
    const e = estimateUpg({ weightedScore: 0.75, completionRate: 0.5 });
    expect(e.confidence).toBe("low");
    expect(e.upperBound - e.lowerBound).toBeCloseTo(0.3, 5); // ±0.15
  });

  it("widens the interval and reaches the failing floor for very weak performance", () => {
    const e = estimateUpg({ weightedScore: 0.05, completionRate: 1 });
    expect(e.pointEstimate).toBeGreaterThan(4.0);
    expect(e.pointEstimate).toBeLessThanOrEqual(UPG_MAX); // failing floor 5.00
    expect(e.readinessBand).toBe("failed");
    // Even at high completion, the performance term widens the band well past 0.05.
    expect(e.upperBound - e.lowerBound).toBeGreaterThan(0.2);
  });

  it("never reports outside [1.00, 5.00] even at the extremes", () => {
    const best = estimateUpg({ weightedScore: 1, completionRate: 1 });
    expect(best.lowerBound).toBeGreaterThanOrEqual(UPG_MIN);
    const worst = estimateUpg({ weightedScore: 0, completionRate: 0 });
    expect(worst.upperBound).toBeLessThanOrEqual(UPG_MAX);
  });
});

function moduleScore(partial: Partial<ModuleScore> & { name: string; weightedAccuracy: number }): ModuleScore {
  return {
    module: "math",
    correct: 0,
    total: 10,
    answered: 10,
    unanswered: 0,
    accuracy: partial.weightedAccuracy,
    weightedCorrect: 0,
    weightedTotal: 0,
    level: "steady",
    topics: [],
    ...partial,
  };
}

describe("deriveUpgDrivers", () => {
  it("identifies strongest and weakest sections and flags unanswered", () => {
    const drivers = deriveUpgDrivers([
      moduleScore({ name: "Reading", weightedAccuracy: 88 }),
      moduleScore({ name: "Math", weightedAccuracy: 41, unanswered: 3 }),
      moduleScore({ name: "Science", weightedAccuracy: 60 }),
    ]);
    expect(drivers.strongestPositiveSection).toBe("Reading");
    expect(drivers.largestDragSection).toBe("Math");
    expect(drivers.completionPenaltyApplied).toBe(true);
    expect(drivers.timePenaltyApplied).toBe(false);
  });

  it("surfaces up to three highest-impact topics, weakest first", () => {
    const drivers = deriveUpgDrivers([
      moduleScore({
        name: "Math",
        weightedAccuracy: 50,
        topics: [
          { topic: "Algebra", module: "math", correct: 1, total: 5, accuracy: 20, level: "needs_work" },
          { topic: "Geometry", module: "math", correct: 2, total: 5, accuracy: 40, level: "needs_work" },
          { topic: "Trig", module: "math", correct: 4, total: 5, accuracy: 80, level: "strong" },
          { topic: "Stats", module: "math", correct: 3, total: 5, accuracy: 60, level: "steady" },
        ],
      }),
    ]);
    expect(drivers.highestImpactTopics).toEqual(["Algebra", "Geometry", "Stats"]);
  });
});
