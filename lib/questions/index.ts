import type { ModuleId, ModuleMeta, Passage, Question } from "@/lib/types";
import { languageQuestions } from "./language";
import { readingQuestions } from "./reading";
import { mathQuestions } from "./math";
import { scienceQuestions } from "./science";
import { passages } from "./passages";

/** All authored questions across modules (any review status). */
const ALL_QUESTIONS: Question[] = [
  ...languageQuestions,
  ...readingQuestions,
  ...mathQuestions,
  ...scienceQuestions,
];

/**
 * Production gate: only `approved` items are ever served to students.
 * Items marked `needs_review` or `rejected` are excluded.
 */
export const approvedQuestions: Question[] = ALL_QUESTIONS.filter(
  (q) => q.reviewStatus === "approved",
);

export const MODULE_ORDER: ModuleId[] = ["language", "reading", "math", "science"];

export const MODULES: Record<ModuleId, ModuleMeta> = {
  language: {
    id: "language",
    name: "Language Proficiency",
    shortName: "Language",
    blurb: "Grammar, vocabulary, idioms, sentence correction, and analogies.",
    itemCount: languageQuestions.filter((q) => q.reviewStatus === "approved").length,
    estimatedMinutes: 12,
  },
  reading: {
    id: "reading",
    name: "Reading Comprehension",
    shortName: "Reading",
    blurb: "Short passages with main-idea, inference, and vocabulary questions.",
    itemCount: readingQuestions.filter((q) => q.reviewStatus === "approved").length,
    estimatedMinutes: 12,
  },
  math: {
    id: "math",
    name: "Mathematics",
    shortName: "Math",
    blurb: "Number sense, algebra, geometry, word problems, and data.",
    itemCount: mathQuestions.filter((q) => q.reviewStatus === "approved").length,
    estimatedMinutes: 10,
  },
  science: {
    id: "science",
    name: "Science",
    shortName: "Science",
    blurb: "Biology, chemistry, physics, earth science, and general science.",
    itemCount: scienceQuestions.filter((q) => q.reviewStatus === "approved").length,
    estimatedMinutes: 11,
  },
};

const PASSAGE_BY_ID: Record<string, Passage> = Object.fromEntries(
  passages.map((p) => [p.id, p]),
);

export function isModuleId(value: string): value is ModuleId {
  return (MODULE_ORDER as string[]).includes(value);
}

/** Approved questions for a module, in authored order. */
export function getModuleQuestions(module: ModuleId): Question[] {
  return approvedQuestions.filter((q) => q.module === module);
}

export function getPassage(id?: string): Passage | undefined {
  return id ? PASSAGE_BY_ID[id] : undefined;
}

export function getQuestionById(id: string): Question | undefined {
  return approvedQuestions.find((q) => q.id === id);
}

/**
 * Practice pool for a module. When weak topics are provided, prefer items
 * from those topics; fall back to the full module pool. Returns up to `limit`.
 */
export function getPracticeQuestions(
  module: ModuleId,
  weakTopics: string[],
  limit = 12,
): Question[] {
  const pool = getModuleQuestions(module);
  const weakSet = new Set(weakTopics.map((t) => t.toLowerCase()));
  const preferred = pool.filter((q) => weakSet.has(q.topic.toLowerCase()));
  const rest = pool.filter((q) => !weakSet.has(q.topic.toLowerCase()));
  const ordered = [...preferred, ...rest];
  return ordered.slice(0, Math.min(limit, ordered.length));
}

export { languageQuestions, readingQuestions, mathQuestions, scienceQuestions, passages };
