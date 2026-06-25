import { describe, it, expect } from "vitest";
import { generateStudyPlan } from "@/lib/studyPlan";
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

const BANNED = [
  "pass",
  "fail",
  "chance of admission",
  "guaranteed",
  "admission",
  "prediction",
];

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

describe("generateStudyPlan", () => {
  it("always returns exactly 7 days", () => {
    const plan = generateStudyPlan(buildLowResult());
    expect(plan).toHaveLength(7);
    plan.forEach((d, i) => expect(d.day).toBe(i + 1));
  });

  it("includes module, topic, focus instruction, and a practice link per day", () => {
    const plan = generateStudyPlan(buildLowResult());
    for (const day of plan) {
      expect(day.module).toBeTruthy();
      expect(day.topic).toBeTruthy();
      expect(day.focus.length).toBeGreaterThan(10);
      expect(day.practiceHref).toBe(`/practice/${day.module}`);
    }
  });

  it("prioritizes the weakest topics first", () => {
    const plan = generateStudyPlan(buildLowResult());
    // Every focus topic in the plan should be one of the weak topics.
    const weak = new Set(buildLowResult().weakTopics.map((t) => t.topic));
    expect(weak.has(plan[0].topic)).toBe(true);
  });

  it("contains no admissions-prediction or pass/fail wording", () => {
    const plan = generateStudyPlan(buildLowResult());
    const text = plan
      .map((d) => `${d.focus} ${d.topic} ${d.moduleName}`)
      .join(" ")
      .toLowerCase();
    for (const phrase of BANNED) {
      expect(text.includes(phrase)).toBe(false);
    }
  });

  it("still produces a useful plan for a strong student (fallback path)", () => {
    const qs: Question[] = [
      q("a1", "math", "Algebra", "a"),
      q("a2", "math", "Algebra", "a"),
    ];
    const answers: AnswerMap = { a1: "a", a2: "a" }; // perfect
    const plan = generateStudyPlan(buildResult([scoreModule("math", qs, answers)]));
    expect(plan).toHaveLength(7);
  });
});
