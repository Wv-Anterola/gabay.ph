import type { DiagnosticResult, StudyDay, TopicScore } from "@/lib/types";
import { MODULES } from "@/lib/questions";

/**
 * Deterministic 7-day UPCAT study plan generator.
 *
 * Input: a scored DiagnosticResult plus a daily review-time budget in minutes.
 * Output: exactly 7 days, each with one or more focus topics and an explicit
 * minute allotment per topic. Weaker topics get more minutes, and a bigger
 * budget fits more topics per day.
 *
 * The plan is deliberately just a schedule — which topics, which day, how
 * long — not study instructions. Students bring their own materials for the
 * MVP; how they study is up to them.
 *
 * No AI, no randomness, no admissions claims. The same result and budget
 * always yield the same plan.
 */

const PLAN_LENGTH = 7;
const MINUTE_STEP = 5;

/** Daily review-time budgets the student can pick from. */
export const STUDY_TIME_OPTIONS = [30, 60, 120] as const;
export type StudyMinutes = (typeof STUDY_TIME_OPTIONS)[number];
export const DEFAULT_STUDY_MINUTES: StudyMinutes = 60;

/** How many topics fit in one day at a given budget. */
function topicsPerDay(dailyMinutes: number): number {
  if (dailyMinutes >= 120) return 3;
  if (dailyMinutes >= 60) return 2;
  return 1;
}

/**
 * Choose which topics to study, weakest first, balanced so the plan does not
 * spend every slot on a single module when several modules need work.
 *
 * TODO(study-plan-clustering): topic selection here inherits the arbitrary
 * ordering of `result.weakTopics`. Many topics are backed by a single mock
 * item, so accuracy is a noisy 0%/100% and the weakest-first sort breaks ties
 * on sample size + name — surfacing granular, hard-to-action topics (e.g.
 * "Tone Analysis", "English Sentence Order") that a student can't meaningfully
 * "review" on their own without practice sets. This hurts Language Proficiency
 * and Reading most, where topics are fine-grained and not independently
 * improvable. Figure out a deterministic way to cluster related fine-grained
 * topics into coarser, actionable focus areas (and/or weight by item count so
 * single-item topics don't dominate) before we lean on this plan harder. Keep
 * it deterministic — same result -> same clustering.
 */
function selectFocusTopics(result: DiagnosticResult, count: number): TopicScore[] {
  const weak = [...result.weakTopics]; // already sorted most-urgent first

  // Fallback: if nothing flagged weak (rare, strong student), use the lowest
  // overall topics so the plan is still useful.
  const pool =
    weak.length > 0
      ? weak
      : result.modules
          .flatMap((m) => m.topics)
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, count);

  // Per-module cap scales with how many slots we need to fill.
  const moduleCap = Math.max(2, Math.ceil(count / 4));

  const selected: TopicScore[] = [];
  const usedPerModule = new Map<string, number>();

  // First pass: spread across modules to avoid monotony.
  for (const topic of pool) {
    if (selected.length >= count) break;
    const used = usedPerModule.get(topic.module) ?? 0;
    if (used < moduleCap) {
      selected.push(topic);
      usedPerModule.set(topic.module, used + 1);
    }
  }

  // Second pass: fill remaining slots from the pool in order (allow repeats of
  // the most urgent topics if there are not enough distinct ones).
  let i = 0;
  while (selected.length < count && pool.length > 0) {
    selected.push(pool[i % pool.length]);
    i += 1;
  }

  return selected.slice(0, count);
}

/**
 * Split a day's budget across its topics in 5-minute steps, proportional to
 * how weak each topic is. Topics must be ordered weakest first; leftover steps
 * go to the weakest topics, so a weaker topic never gets fewer minutes than a
 * stronger one. Minutes always sum exactly to the budget.
 */
function allocateMinutes(topics: TopicScore[], budget: number): number[] {
  if (topics.length === 0) return [];
  const weights = topics.map((t) => Math.max(100 - t.accuracy, 20));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const totalSteps = Math.round(budget / MINUTE_STEP);

  const steps = weights.map((w) => Math.floor((totalSteps * w) / totalWeight));
  let leftover = totalSteps - steps.reduce((sum, s) => sum + s, 0);
  for (let i = 0; leftover > 0; i = (i + 1) % steps.length) {
    steps[i] += 1;
    leftover -= 1;
  }

  return steps.map((s) => s * MINUTE_STEP);
}

export function generateStudyPlan(
  result: DiagnosticResult,
  dailyMinutes: number = DEFAULT_STUDY_MINUTES,
): StudyDay[] {
  const perDay = topicsPerDay(dailyMinutes);
  const selected = selectFocusTopics(result, PLAN_LENGTH * perDay);
  if (selected.length === 0) return [];

  return Array.from({ length: PLAN_LENGTH }, (_, dayIdx) => {
    // Deal topics out day by day, weakest days first.
    const chunk = selected.slice(dayIdx * perDay, (dayIdx + 1) * perDay);

    // Drop duplicates within a day (possible when few topics repeat to fill
    // the week), then order weakest first for allocation and display.
    const seen = new Set<string>();
    const dayTopics = chunk.filter((t) => {
      const key = `${t.module}:${t.topic}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    dayTopics.sort((a, b) => a.accuracy - b.accuracy);

    const minutes = allocateMinutes(dayTopics, dailyMinutes);

    return {
      day: dayIdx + 1,
      totalMinutes: dailyMinutes,
      topics: dayTopics.map((topic, i) => ({
        module: topic.module,
        moduleName: MODULES[topic.module].name,
        topic: topic.topic,
        accuracy: topic.accuracy,
        minutes: minutes[i],
      })),
    };
  });
}
