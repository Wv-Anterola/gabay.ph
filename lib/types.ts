/** Core domain types for Gabay's UPCAT diagnostic. */

export type ModuleId = "language" | "reading" | "math" | "science";

export type ChoiceId = "a" | "b" | "c" | "d";

export type Difficulty = "easy" | "medium" | "hard";

export type ReviewStatus = "needs_review" | "approved" | "rejected";

export interface Choice {
  id: ChoiceId;
  text: string;
}

export interface Question {
  id: string;
  module: ModuleId;
  topic: string;
  subtopic?: string;
  difficulty: Difficulty;
  stem: string;
  passageId?: string;
  choices: Choice[];
  answer: ChoiceId;
  explanation: string;
  estimatedTimeSeconds?: number;
  sourceType: "original_generated";
  reviewStatus: ReviewStatus;
  tags?: string[];
}

export interface Passage {
  id: string;
  title: string;
  body: string;
}

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  shortName: string;
  blurb: string;
  /** Number of items in the diagnostic mini-test for this module. */
  itemCount: number;
  estimatedMinutes: number;
}

/** A learner's selected answers for one module, keyed by question id. */
export type AnswerMap = Record<string, ChoiceId>;

export type ReadinessLevel = "strong" | "steady" | "needs_work";

export interface TopicScore {
  topic: string;
  module: ModuleId;
  correct: number;
  total: number;
  accuracy: number; // 0-100
  level: ReadinessLevel;
}

export interface ModuleScore {
  module: ModuleId;
  name: string;
  correct: number;
  total: number;
  answered: number;
  unanswered: number;
  accuracy: number; // 0-100
  level: ReadinessLevel;
  topics: TopicScore[];
}

export interface DiagnosticResult {
  modules: ModuleScore[];
  overall: {
    correct: number;
    total: number;
    answered: number;
    unanswered: number;
    accuracy: number; // 0-100
    level: ReadinessLevel;
  };
  /** Weakest topics first (lowest accuracy / most urgent). */
  weakTopics: TopicScore[];
  /** Strongest topics first. */
  strengths: TopicScore[];
}

export interface StudyDay {
  day: number; // 1-7
  module: ModuleId;
  moduleName: string;
  topic: string;
  focus: string; // short study instruction
  practiceHref: string; // deep link into /practice/[module]
}

/** What we persist locally per module attempt. */
export interface StoredModuleAttempt {
  module: ModuleId;
  answers: AnswerMap;
  questionIds: string[];
  startedAt: number;
  completedAt?: number;
}
