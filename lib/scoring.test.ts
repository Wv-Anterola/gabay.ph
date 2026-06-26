import { describe, it, expect } from "vitest";
import { scoreModule, buildResult, readinessLevel } from "@/lib/scoring";
import type { AnswerMap, Question } from "@/lib/types";

function q(id: string, topic: string, answer: "a" | "b" | "c" | "d"): Question {
  return {
    id,
    module: "math",
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

const QUESTIONS: Question[] = [
  q("m1", "Algebra", "a"),
  q("m2", "Algebra", "b"),
  q("m3", "Geometry", "c"),
  q("m4", "Geometry", "d"),
  q("m5", "Number Sense", "a"),
];

describe("readinessLevel", () => {
  it("maps thresholds correctly", () => {
    expect(readinessLevel(100)).toBe("strong");
    expect(readinessLevel(80)).toBe("strong");
    expect(readinessLevel(79)).toBe("steady");
    expect(readinessLevel(60)).toBe("steady");
    expect(readinessLevel(59)).toBe("needs_work");
    expect(readinessLevel(0)).toBe("needs_work");
  });
});

describe("scoreModule", () => {
  it("scores a perfect attempt", () => {
    const answers: AnswerMap = { m1: "a", m2: "b", m3: "c", m4: "d", m5: "a" };
    const s = scoreModule("math", QUESTIONS, answers);
    expect(s.correct).toBe(5);
    expect(s.total).toBe(5);
    expect(s.accuracy).toBe(100);
    expect(s.unanswered).toBe(0);
    expect(s.level).toBe("strong");
  });

  it("scores an all-wrong attempt as needs_work", () => {
    const answers: AnswerMap = { m1: "b", m2: "a", m3: "a", m4: "a", m5: "b" };
    const s = scoreModule("math", QUESTIONS, answers);
    expect(s.correct).toBe(0);
    expect(s.accuracy).toBe(0);
    expect(s.level).toBe("needs_work");
  });

  it("counts unanswered questions as not correct", () => {
    const answers: AnswerMap = { m1: "a", m2: "b" }; // 3 left blank
    const s = scoreModule("math", QUESTIONS, answers);
    expect(s.answered).toBe(2);
    expect(s.unanswered).toBe(3);
    expect(s.correct).toBe(2);
    expect(s.accuracy).toBe(40);
  });

  it("calculates difficulty-weighted accuracy", () => {
    const qs: Question[] = [
      { ...q("easy", "Algebra", "a"), difficulty: "easy" },
      { ...q("medium", "Algebra", "a"), difficulty: "medium" },
      { ...q("hard", "Algebra", "a"), difficulty: "hard" },
    ];
    const s = scoreModule("math", qs, { easy: "a", medium: "b", hard: "a" });
    expect(s.correct).toBe(2);
    expect(s.accuracy).toBe(67);
    expect(s.weightedCorrect).toBe(2.5);
    expect(s.weightedTotal).toBe(3.75);
    expect(s.weightedAccuracy).toBe(67);
  });

  it("orders topic scores weakest first", () => {
    // Algebra 2/2 (100%), Geometry 0/2 (0%), Number Sense 1/1 (100%)
    const answers: AnswerMap = { m1: "a", m2: "b", m3: "a", m4: "a", m5: "a" };
    const s = scoreModule("math", QUESTIONS, answers);
    expect(s.topics[0].topic).toBe("Geometry");
    expect(s.topics[0].accuracy).toBe(0);
  });
});

describe("buildResult", () => {
  it("aggregates modules and surfaces weak topics first", () => {
    const answers: AnswerMap = { m1: "a", m2: "b", m3: "a", m4: "a", m5: "a" };
    const moduleScore = scoreModule("math", QUESTIONS, answers);
    const result = buildResult([moduleScore]);

    expect(result.overall.total).toBe(5);
    expect(result.overall.correct).toBe(3);
    expect(result.overall.accuracy).toBe(60);
    // Geometry (0%) must be the most urgent weak topic.
    expect(result.weakTopics[0].topic).toBe("Geometry");
    // Strong topics should include the 100% topics.
    expect(result.strengths.some((t) => t.topic === "Algebra")).toBe(true);
  });

  it("flags a relatively weak topic even when above 60%", () => {
    // Make module accuracy high but one topic clearly lower than the rest.
    const qs: Question[] = [
      q("a1", "TopicA", "a"),
      q("a2", "TopicA", "a"),
      q("b1", "TopicB", "a"),
      q("b2", "TopicB", "a"),
    ];
    // TopicA 2/2 = 100%, TopicB 1/2 = 50% -> module 75%
    const answers: AnswerMap = { a1: "a", a2: "a", b1: "a", b2: "b" };
    const result = buildResult([scoreModule("math", qs, answers)]);
    expect(result.weakTopics.some((t) => t.topic === "TopicB")).toBe(true);
  });
});
