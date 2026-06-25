import type { DiagnosticResult, StudyDay, TopicScore } from "@/lib/types";
import { MODULES } from "@/lib/questions";

/**
 * Deterministic 7-day UPCAT study plan generator.
 *
 * Input: a scored DiagnosticResult.
 * Output: exactly 7 days, each with a focus module + topic, a short study
 * instruction, and a deep link into the practice flow.
 *
 * No AI, no randomness, no admissions claims. The same result always yields
 * the same plan. Language is strictly "study guidance," never prediction.
 */

const PLAN_LENGTH = 7;

/** Short, encouraging, non-overclaiming instruction tuned to how weak the topic is. */
function instructionFor(topic: TopicScore): string {
  if (topic.accuracy < 40) {
    return `Start with the basics of ${topic.topic.toLowerCase()}. Review one worked example, then try a few practice items slowly.`;
  }
  if (topic.accuracy < 60) {
    return `Build confidence in ${topic.topic.toLowerCase()}. Redo the items you missed and note the rule behind each answer.`;
  }
  return `Sharpen ${topic.topic.toLowerCase()}. Practice a timed set and focus on the one or two patterns that still trip you up.`;
}

/**
 * Choose which topics to study, weakest first, balanced so the plan does not
 * spend all 7 days on a single module when several modules need work.
 */
function selectFocusTopics(result: DiagnosticResult): TopicScore[] {
  const weak = [...result.weakTopics]; // already sorted most-urgent first

  // Fallback: if nothing flagged weak (rare, strong student), use the lowest
  // overall topics so the plan is still useful.
  const pool =
    weak.length > 0
      ? weak
      : result.modules
          .flatMap((m) => m.topics)
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, PLAN_LENGTH);

  const selected: TopicScore[] = [];
  const usedPerModule = new Map<string, number>();

  // First pass: spread across modules (max 2 per module) to avoid monotony.
  for (const topic of pool) {
    if (selected.length >= PLAN_LENGTH) break;
    const count = usedPerModule.get(topic.module) ?? 0;
    if (count < 2) {
      selected.push(topic);
      usedPerModule.set(topic.module, count + 1);
    }
  }

  // Second pass: fill remaining days from the pool in order (allow repeats of
  // the most urgent topics if there are not enough distinct ones).
  let i = 0;
  while (selected.length < PLAN_LENGTH && pool.length > 0) {
    selected.push(pool[i % pool.length]);
    i += 1;
  }

  return selected.slice(0, PLAN_LENGTH);
}

export function generateStudyPlan(result: DiagnosticResult): StudyDay[] {
  const topics = selectFocusTopics(result);

  return topics.map((topic, idx) => ({
    day: idx + 1,
    module: topic.module,
    moduleName: MODULES[topic.module].name,
    topic: topic.topic,
    focus: instructionFor(topic),
    practiceHref: `/practice/${topic.module}`,
  }));
}
