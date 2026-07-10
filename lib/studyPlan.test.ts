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
  const scienceQs: Question[] = [
    q("s1", "science", "Biology", "a"),
    q("s2", "science", "Chemistry", "b"),
  ];
  return buildResult([
    scoreModule("math", mathQs, { m1: "d", m2: "d", m3: "d" }),
    scoreModule("science", scienceQs, { s1: "d", s2: "d" }),
  ]);
}

/** Two weak areas with clearly different accuracy: Algebra 0%, Geometry 50%. */
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
      plan.forEach((day, i) => expect(day.day).toBe(i + 1));
    }
  });

  it("includes a broad focus, question types, mock accuracy, and minutes per area", () => {
    const plan = generateStudyPlan(buildLowResult());
    for (const day of plan) {
      expect(day.topics.length).toBeGreaterThan(0);
      for (const area of day.topics) {
        expect(area.id).toBeTruthy();
        expect(area.module).toBeTruthy();
        expect(area.moduleName).toBeTruthy();
        expect(area.focus).toBeTruthy();
        expect(area.questionTypes.length).toBeGreaterThan(0);
        expect(area.accuracy).toBeGreaterThanOrEqual(0);
        expect(area.accuracy).toBeLessThanOrEqual(100);
        expect(area.minutes).toBeGreaterThan(0);
      }
    }
  });

  it("prioritizes the weakest broad area first", () => {
    const plan = generateStudyPlan(buildLowResult());
    expect(plan[0].topics[0]).toMatchObject({
      module: "math",
      focus: "Number sense & algebra",
      accuracy: 0,
    });
  });

  it("carries each grouped area's accuracy from the result", () => {
    const plan = generateStudyPlan(buildUnevenResult(), 60);
    const [algebra, geometry] = plan[0].topics;
    expect(algebra.focus).toBe("Number sense & algebra");
    expect(algebra.accuracy).toBe(0);
    expect(geometry.focus).toBe("Geometry & measurement");
    expect(geometry.accuracy).toBe(50);
  });

  it("still produces a useful plan for a strong student", () => {
    const qs: Question[] = [q("a1", "math", "Algebra", "a"), q("a2", "math", "Algebra", "a")];
    const plan = generateStudyPlan(buildResult([scoreModule("math", qs, { a1: "a", a2: "a" })]));
    expect(plan).toHaveLength(7);
    plan.forEach((day) => expect(day.topics.length).toBeGreaterThan(0));
  });

  describe("time allocation", () => {
    it("spends exactly the daily budget every day, in 5-minute steps", () => {
      for (const budget of STUDY_TIME_OPTIONS) {
        const plan = generateStudyPlan(buildLowResult(), budget);
        for (const day of plan) {
          expect(day.totalMinutes).toBe(budget);
          expect(day.topics.reduce((sum, topic) => sum + topic.minutes, 0)).toBe(budget);
          day.topics.forEach((topic) => expect(topic.minutes % 5).toBe(0));
        }
      }
    });

    it("fits more areas per day when the budget is bigger", () => {
      const result = buildLowResult();
      expect(generateStudyPlan(result, 30)[0].topics).toHaveLength(1);
      expect(generateStudyPlan(result, 60)[0].topics).toHaveLength(2);
      expect(generateStudyPlan(result, 120)[0].topics).toHaveLength(3);
    });

    it("gives weaker areas more minutes within a day", () => {
      const day = generateStudyPlan(buildUnevenResult(), 60)[0];
      expect(day.topics.map((topic) => topic.focus)).toEqual([
        "Number sense & algebra",
        "Geometry & measurement",
      ]);
      expect(day.topics[0].minutes).toBeGreaterThan(day.topics[1].minutes);
      expect(day.topics[0].minutes + day.topics[1].minutes).toBe(60);
    });

    it("never gives a weaker area fewer minutes than a stronger one", () => {
      for (const budget of STUDY_TIME_OPTIONS) {
        for (const day of generateStudyPlan(buildLowResult(), budget)) {
          for (let i = 1; i < day.topics.length; i += 1) {
            expect(day.topics[i - 1].minutes).toBeGreaterThanOrEqual(day.topics[i].minutes);
          }
        }
      }
    });

    it("does not repeat an area within the same day", () => {
      for (const budget of STUDY_TIME_OPTIONS) {
        for (const day of generateStudyPlan(buildUnevenResult(), budget)) {
          const keys = day.topics.map((topic) => `${topic.module}:${topic.id}`);
          expect(new Set(keys).size).toBe(keys.length);
        }
      }
    });

    it("is deterministic: the same result and budget yield the same plan", () => {
      for (const budget of STUDY_TIME_OPTIONS) {
        expect(generateStudyPlan(buildLowResult(), budget)).toEqual(
          generateStudyPlan(buildLowResult(), budget),
        );
      }
    });
  });

  it("condenses raw language topics into one area with useful question types", () => {
    const result = buildResult([
      scoreModule(
        "language",
        [q("l1", "language", "Grammar", "a"), q("l2", "language", "Sentence Correction", "a")],
        { l1: "d", l2: "d" },
      ),
    ]);
    const [area] = generateStudyPlan(result, 30)[0].topics;

    expect(area).toMatchObject({
      focus: "Grammar & sentence construction",
      questionTypes: ["Grammar and usage", "Sentence correction and ordering"],
      accuracy: 0,
    });
  });

  it("keeps every tested UPCAT subtest in the week before repeating areas", () => {
    const result = buildResult([
      scoreModule("language", [q("l1", "language", "Grammar", "a")], { l1: "d" }),
      scoreModule("reading", [q("r1", "reading", "Main Idea", "a")], { r1: "d" }),
      scoreModule("math", [q("m1", "math", "Algebra", "a")], { m1: "d" }),
      scoreModule("science", [q("s1", "science", "Biology", "a")], { s1: "d" }),
    ]);
    const modules = new Set(
      generateStudyPlan(result, 30).flatMap((day) => day.topics.map((topic) => topic.module)),
    );

    expect(modules).toEqual(new Set(["language", "reading", "math", "science"]));
  });
});
