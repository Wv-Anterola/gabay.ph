import type {
  ModuleId,
  ModuleMeta,
  Passage,
  Question,
  QuestionBank,
  QuestionBankMeta,
} from "@/lib/types";
import { languageQuestions } from "./language";
import { readingQuestions } from "./reading";
import { mathQuestions } from "./math";
import { scienceQuestions } from "./science";
import { passages } from "./passages";
import { importedBanks } from "./imported";

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

/* ------------------------------------------------------------------ *
 * Question banks
 *
 * The preset "core" bank is the authored pool above. Additional banks
 * (e.g. authored in Markdown and run through `npm run questions:import`)
 * are appended from `imported.ts`. Today only the preset is served; the
 * registry is the seam for serving alternates later.
 * ------------------------------------------------------------------ */

export const PRESET_BANK_ID = "core";

const coreBank: QuestionBank = {
  id: PRESET_BANK_ID,
  name: "Tero Core Mock",
  description: "Default UPCAT mock exam built from Tero's authored question pool.",
  questions: approvedQuestions,
  passages,
};

const ALL_BANKS: QuestionBank[] = [coreBank, ...importedBanks];
const BANK_BY_ID = new Map<string, QuestionBank>(ALL_BANKS.map((b) => [b.id, b]));

/** Every question across every bank, for id lookups during resume/review. */
const QUESTION_BY_ID = new Map<string, Question>(
  ALL_BANKS.flatMap((b) => b.questions).map((q) => [q.id, q]),
);

export function listBanks(): QuestionBankMeta[] {
  return ALL_BANKS.map(({ id, name, description }) => ({ id, name, description }));
}

export function getBank(id: string = PRESET_BANK_ID): QuestionBank | undefined {
  return BANK_BY_ID.get(id);
}

export function getPresetBank(): QuestionBank {
  return coreBank;
}

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
  ALL_BANKS.flatMap((b) => b.passages).map((p) => [p.id, p]),
);

export function isModuleId(value: string): value is ModuleId {
  return (MODULE_ORDER as string[]).includes(value);
}

/** Approved questions for a module in a given bank, in authored order. */
export function getModuleQuestions(
  module: ModuleId,
  bankId: string = PRESET_BANK_ID,
): Question[] {
  const bank = getBank(bankId) ?? coreBank;
  return bank.questions.filter(
    (q) => q.module === module && q.reviewStatus === "approved",
  );
}

export function getPassage(id?: string): Passage | undefined {
  return id ? PASSAGE_BY_ID[id] : undefined;
}

/** Find a question by id across every bank (preset + imported). */
export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BY_ID.get(id);
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
