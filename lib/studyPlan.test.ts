import { describe, it, expect } from "vitest";
import { generateStudyPlan, STUDY_TIME_OPTIONS } from "@/lib/studyPlan";
import { scoreModule, buildResult } from "@/lib/scoring";
import type { AnswerMap, Question } from "@/lib/types";

function q(
  id: string,
  module: Question["module"],
  topic: string,
  answer: "a" | "b" | "c" | "d",
): Question {
  return {
    id,
    module,
    topic,
    difficulty: "easy",
    stem: `stem ${id}`,
    choices: [
      { id: "a", text: "a" },
      { id: "b", text: "b" },
      { id: "c", text: "c" },
      { id: "d", text: "d" },
    ],
    answer,
    explanation: "because",
    sourceType: "original_generated",
    reviewStatus: "approved",
  };
}

function buildLowResult() {
  const mathQs: Question[] = [
    q("m1", "math", "Algebra", "a"),
    q("m2", "math", "Algebra", "b"),
    q("m3", "math", "Geometry", "c"),
  ];
  const sciQs: Question[] = [
    q("s1", "science", "Biology", "a"),
    q("s2", "science", "Chemistry", "b"),
  ];
  // All wrong -> everything weak.
  const mathAns: AnswerMap = { m1: "d", m2: "d", m3: "d" };
  const sciAns: AnswerMap = { s1: "d", s2: "d" };
  return buildResult([
    scoreModule("math", mathQs, mathAns),
    scoreModule("science", sciQs, sciAns),
  ]);
}

/** Two weak topics with clearly different accuracy: Algebra 0%, Geometry 50%. */
function buildUnevenResult() {
  const qs: Question[] = [
    q("m1", "math", "Algebra", "a"),
    q("m2", "math", "Algebra", "a"),
    q("m3", "math", "Geometry", "a"),
    q("m4", "math", "Geometry", "a"),
  ];
  const answers: AnswerMap = { m1: "d", m2: "d", m3: "a", m4: "d" };
  return buildResult([scoreModule("math", qs, answers)]);
}

describe("generateStudyPlan", () => {
  it("always returns exactly 7 days", () => {
    for (const budget of STUDY_TIME_OPTIONS) {
      const plan = generateStudyPlan(buildLowResult(), budget);
      expect(plan).toHaveLength(7);
      plan.forEach((d, i) => expect(d.day).toBe(i + 1));
    }
  });

  it("includes module, topic, mock accuracy, and minutes per topic", () => {
    const plan = generateStudyPlan(buildLowResult());
    for (const day of plan) {
      expect(day.topics.length).toBeGreaterThan(0);
      for (const t of day.topics) {
        expect(t.module).toBeTruthy();
        expect(t.moduleName).toBeTruthy();
        expect(t.topic).toBeTruthy();
        expect(t.accuracy).toBeGreaterThanOrEqual(0);
        expect(t.accuracy).toBeLessThanOrEqual(100);
        expect(t.minutes).toBeGreaterThan(0);
      }
    }
  });

  it("prioritizes the weakest topics first", () => {
    const plan = generateStudyPlan(buildLowResult());
    const weak = new Set(buildLowResult().weakTopics.map((t) => t.topic));
    expect(weak.has(plan[0].topics[0].topic)).toBe(true);
  });

  it("carries each topic's accuracy from the result", () => {
    const plan = generateStudyPlan(buildUnevenResult(), 60);
    const [algebra, geometry] = plan[0].topics;
    expect(algebra.topic).toBe("Algebra");
    expect(algebra.accuracy).toBe(0);
    expect(geometry.topic).toBe("Geometry");
    expect(geometry.accuracy).toBe(50);
  });

  it("still produces a useful plan for a strong student (fallback path)", () => {
    const qs: Question[] = [
      q("a1", "math", "Algebra", "a"),
      q("a2", "math", "Algebra", "a"),
    ];
    const answers: AnswerMap = { a1: "a", a2: "a" }; // perfect
    const plan = generateStudyPlan(buildResult([scoreModule("math", qs, answers)]));
    expect(plan).toHaveLength(7);
    plan.forEach((d) => expect(d.topics.length).toBeGreaterThan(0));
  });

  describe("time allocation", () => {
    it("spends exactly the daily budget every day, in 5-minute steps", () => {
      for (const budget of STUDY_TIME_OPTIONS) {
        const plan = generateStudyPlan(buildLowResult(), budget);
        for (const day of plan) {
          expect(day.totalMinutes).toBe(budget);
          const sum = day.topics.reduce((s, t) => s + t.minutes, 0);
          expect(sum).toBe(budget);
          day.topics.forEach((t) => expect(t.minutes % 5).toBe(0));
        }
      }
    });

    it("fits more topics per day when the budget is bigger", () => {
      const result = buildLowResult(); // 4 distinct weak topics
      const small = generateStudyPlan(result, 30);
      const medium = generateStudyPlan(result, 60);
      const large = generateStudyPlan(result, 120);
      expect(small[0].topics).toHaveLength(1);
      expect(medium[0].topics).toHaveLength(2);
      expect(large[0].topics).toHaveLength(3);
    });

    it("gives weaker topics more minutes within a day", () => {
      const plan = generateStudyPlan(buildUnevenResult(), 60);
      const day1 = plan[0];
      expect(day1.topics.map((t) => t.topic)).toEqual(["Algebra", "Geometry"]);
      const [algebra, geometry] = day1.topics;
      expect(algebra.minutes).toBeGreaterThan(geometry.minutes);
      expect(algebra.minutes + geometry.minutes).toBe(60);
    });

    it("never gives a weaker topic fewer minutes than a stronger one", () => {
      for (const budget of STUDY_TIME_OPTIONS) {
        const plan = generateStudyPlan(buildLowResult(), budget);
        for (const day of plan) {
          for (let i = 1; i < day.topics.length; i += 1) {
            expect(day.topics[i - 1].minutes).toBeGreaterThanOrEqual(
              day.topics[i].minutes,
            );
          }
        }
      }
    });

    it("does not repeat a topic within the same day", () => {
      for (const budget of STUDY_TIME_OPTIONS) {
        const plan = generateStudyPlan(buildUnevenResult(), budget); // only 2 topics
        for (const day of plan) {
          const keys = day.topics.map((t) => `${t.module}:${t.topic}`);
          expect(new Set(keys).size).toBe(keys.length);
        }
      }
    });

    it("is deterministic: same result and budget yield the same plan", () => {
      for (const budget of STUDY_TIME_OPTIONS) {
        const a = generateStudyPlan(buildLowResult(), budget);
        const b = generateStudyPlan(buildLowResult(), budget);
        expect(a).toEqual(b);
      }
    });
  });
});
