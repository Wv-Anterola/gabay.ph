import type {
  AnswerMap,
  DiagnosticResult,
  ModuleId,
  ModuleScore,
  Question,
  ReadinessLevel,
  TopicScore,
} from "@/lib/types";
import { MODULES } from "@/lib/questions";

/**
 * Deterministic scoring for the UPCAT diagnostic.
 *
 * Language is intentionally a "readiness signal," never an admissions prediction.
 * No randomness, no AI, no network — the same answers always produce the same result.
 */

export const READINESS_THRESHOLDS = {
  strong: 80, // >= 80%
  steady: 60, // 60-79%
  // below 60% -> needs_work
} as const;

export function readinessLevel(accuracyPct: number): ReadinessLevel {
  if (accuracyPct >= READINESS_THRESHOLDS.strong) return "strong";
  if (accuracyPct >= READINESS_THRESHOLDS.steady) return "steady";
  return "needs_work";
}

export const READINESS_LABEL: Record<ReadinessLevel, string> = {
  strong: "Strong",
  steady: "Steady",
  needs_work: "Needs work",
};

/** Short, non-overclaiming description for each readiness level. */
export const READINESS_BLURB: Record<ReadinessLevel, string> = {
  strong: "You answered most of these correctly. Keep this area warm with light review.",
  steady: "A solid base with clear room to grow. A few focused sessions will help.",
  needs_work: "This is a good place to start studying. Small, steady practice adds up.",
};

function pct(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/** Score a single module's answers against its question set. */
export function scoreModule(
  module: ModuleId,
  questions: Question[],
  answers: AnswerMap,
): ModuleScore {
  const total = questions.length;
  let correct = 0;
  let answered = 0;

  // topic -> { correct, total }
  const topicTally = new Map<string, { correct: number; total: number }>();

  for (const q of questions) {
    const given = answers[q.id];
    const isCorrect = given === q.answer;
    if (given !== undefined) answered += 1;
    if (isCorrect) correct += 1;

    const t = topicTally.get(q.topic) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (isCorrect) t.correct += 1;
    topicTally.set(q.topic, t);
  }

  const topics: TopicScore[] = [...topicTally.entries()]
    .map(([topic, { correct: c, total: tt }]) => {
      const accuracy = pct(c, tt);
      return {
        topic,
        module,
        correct: c,
        total: tt,
        accuracy,
        level: readinessLevel(accuracy),
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy || a.topic.localeCompare(b.topic));

  const accuracy = pct(correct, total);

  return {
    module,
    name: MODULES[module].name,
    correct,
    total,
    answered,
    unanswered: total - answered,
    accuracy,
    level: readinessLevel(accuracy),
    topics,
  };
}

/**
 * A topic is "weak" if its accuracy is below the Steady threshold (60%)
 * OR strictly below its own module's overall accuracy. This surfaces relative
 * weak spots even for strong students.
 */
function isWeakTopic(topic: TopicScore, moduleAccuracy: number): boolean {
  return topic.accuracy < READINESS_THRESHOLDS.steady || topic.accuracy < moduleAccuracy;
}

/**
 * Combine one or more module scores into an overall diagnostic result with
 * weak topics (most urgent first) and strengths (strongest first).
 */
export function buildResult(moduleScores: ModuleScore[]): DiagnosticResult {
  const correct = moduleScores.reduce((s, m) => s + m.correct, 0);
  const total = moduleScores.reduce((s, m) => s + m.total, 0);
  const answered = moduleScores.reduce((s, m) => s + m.answered, 0);
  const accuracy = pct(correct, total);

  const allTopics: TopicScore[] = moduleScores.flatMap((m) => m.topics);

  const weakTopics = moduleScores
    .flatMap((m) => m.topics.filter((t) => isWeakTopic(t, m.accuracy)))
    // Most urgent first: lowest accuracy, then larger samples, then stable name order.
    .sort(
      (a, b) =>
        a.accuracy - b.accuracy ||
        b.total - a.total ||
        a.topic.localeCompare(b.topic),
    );

  const strengths = [...allTopics]
    .filter((t) => t.level === "strong")
    .sort(
      (a, b) =>
        b.accuracy - a.accuracy ||
        b.total - a.total ||
        a.topic.localeCompare(b.topic),
    );

  return {
    modules: moduleScores,
    overall: {
      correct,
      total,
      answered,
      unanswered: total - answered,
      accuracy,
      level: readinessLevel(accuracy),
    },
    weakTopics,
    strengths,
  };
}
