import type {
  AnswerMap,
  DiagnosticResult,
  MockExamAttempt,
  MockExamResult,
  MockQuestionReview,
  ModuleId,
  ModuleScore,
  Question,
  ReadinessLevel,
  TopicScore,
} from "@/lib/types";
import { MODULES } from "@/lib/questions";
import { deriveUpgDrivers, estimateUpg } from "@/lib/upg";

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

export const DIFFICULTY_WEIGHT: Record<Question["difficulty"], number> = {
  easy: 1,
  medium: 1.25,
  hard: 1.5,
};

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

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
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
  let weightedCorrect = 0;
  let weightedTotal = 0;

  // topic -> { correct, total }
  const topicTally = new Map<string, { correct: number; total: number }>();

  for (const q of questions) {
    const given = answers[q.id];
    const isCorrect = given === q.answer;
    const weight = DIFFICULTY_WEIGHT[q.difficulty];
    if (given !== undefined) answered += 1;
    if (isCorrect) correct += 1;
    if (isCorrect) weightedCorrect += weight;
    weightedTotal += weight;

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
  const weightedAccuracy = pct(weightedCorrect, weightedTotal);

  return {
    module,
    name: MODULES[module].name,
    correct,
    total,
    answered,
    unanswered: total - answered,
    accuracy,
    weightedCorrect: roundScore(weightedCorrect),
    weightedTotal: roundScore(weightedTotal),
    weightedAccuracy,
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
  const weightedCorrect = moduleScores.reduce((s, m) => s + m.weightedCorrect, 0);
  const weightedTotal = moduleScores.reduce((s, m) => s + m.weightedTotal, 0);
  const weightedAccuracy = pct(weightedCorrect, weightedTotal);

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
      weightedCorrect: roundScore(weightedCorrect),
      weightedTotal: roundScore(weightedTotal),
      weightedAccuracy,
      readinessScore: weightedAccuracy,
      level: readinessLevel(weightedAccuracy),
    },
    weakTopics,
    strengths,
  };
}

export function buildMockExamResult(
  attempt: MockExamAttempt,
  questionsByModule: Record<ModuleId, Question[]>,
): MockExamResult {
  const modules = attempt.sectionOrder.map((module) =>
    scoreModule(module, questionsByModule[module] ?? [], attempt.answers),
  );
  const result = buildResult(modules);
  const submittedAt = attempt.submittedAt ?? Date.now();
  const questionReviews: MockQuestionReview[] = attempt.sectionOrder.flatMap((module) =>
    (questionsByModule[module] ?? []).map((q) => {
      const selectedAnswer = attempt.answers[q.id];
      return {
        questionId: q.id,
        module,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        selectedAnswer,
        correctAnswer: q.answer,
        isAnswered: selectedAnswer !== undefined,
        isCorrect: selectedAnswer === q.answer,
        isFlagged: attempt.flaggedQuestionIds.includes(q.id),
        timeSpentSeconds: attempt.questionTimeSpentSeconds[q.id] ?? 0,
      };
    }),
  );

  const upgDrivers = deriveUpgDrivers(result.modules);
  const upgEstimate = estimateUpg({
    weightedScore: (result.overall.weightedAccuracy ?? result.overall.accuracy) / 100,
    completionRate: result.overall.total > 0 ? result.overall.answered / result.overall.total : 0,
    hsAverage: attempt.hsAverage,
    dragSectionName: upgDrivers.largestDragSection || undefined,
  });

  return {
    ...result,
    attemptId: attempt.attemptId,
    startedAt: attempt.startedAt,
    submittedAt,
    durationSeconds: Math.max(0, Math.round((submittedAt - attempt.startedAt) / 1000)),
    remainingSeconds: attempt.remainingSeconds,
    questionReviews,
    upgEstimate,
    upgDrivers,
    hsAverage: attempt.hsAverage,
  };
}
