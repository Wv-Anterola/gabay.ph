/** Core domain types for Tero's UPCAT mock exam. */

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
  /** Which question bank this item belongs to (defaults to the preset "core" bank). */
  bankId?: string;
  topic: string;
  subtopic?: string;
  difficulty: Difficulty;
  stem: string;
  passageId?: string;
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
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

/** Lightweight bank descriptor (no question payload), for pickers and listings. */
export interface QuestionBankMeta {
  id: string;
  name: string;
  description?: string;
}

/**
 * A self-contained set of questions (plus any shared passages) that can be
 * served as one mock exam. The "core" preset bank is built from Tero's
 * authored pool; additional banks are produced by the Markdown importer.
 */
export interface QuestionBank extends QuestionBankMeta {
  questions: Question[];
  passages: Passage[];
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
  weightedCorrect: number;
  weightedTotal: number;
  weightedAccuracy: number; // 0-100
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
    weightedCorrect?: number;
    weightedTotal?: number;
    weightedAccuracy?: number; // 0-100
    readinessScore?: number; // weighted score, 0-100
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

export type MockExamStatus = "in_progress" | "submitted";

export interface MockExamAttempt {
  attemptId: string;
  status: MockExamStatus;
  startedAt: number;
  submittedAt?: number;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  remainingSeconds: number;
  lastSavedAt: number;
  answers: AnswerMap;
  flaggedQuestionIds: string[];
  questionTimeSpentSeconds: Record<string, number>;
  sectionOrder: ModuleId[];
  questionIdsBySection: Record<ModuleId, string[]>;
  /** Which question bank this attempt was drawn from (defaults to the preset). */
  bankId?: string;
  /** Self-reported HS average (avg of G8–G11), 0–100. Feeds the UPG blend. */
  hsAverage?: number;
}

export interface MockQuestionReview {
  questionId: string;
  module: ModuleId;
  topic: string;
  subtopic?: string;
  difficulty: Difficulty;
  selectedAnswer?: ChoiceId;
  correctAnswer: ChoiceId;
  isAnswered: boolean;
  isCorrect: boolean;
  isFlagged: boolean;
  timeSpentSeconds: number;
}

export type UpgConfidence = "low" | "medium" | "high";

/** Official UP Grade Point Equivalence descriptions. */
export type UpgReadinessBand =
  | "excellent"
  | "very_good"
  | "satisfactory"
  | "fair"
  | "failed";

/**
 * Admission standing relative to the ~2.8 appeal line (a separate axis from the
 * grade description). UP admits roughly 10–15% of applicants.
 */
export type UpgAdmissionStanding = "competitive" | "appeal_range" | "below_threshold";

/**
 * Estimated University Predicted Grade. This is a readiness estimate derived
 * from weighted mock performance — NOT an official UP computation. Lower is
 * better (UP grades run 1.00 best to 3.00+). Always presented as a range.
 */
export interface UpgEstimate {
  pointEstimate: number; // e.g. 2.14
  lowerBound: number; // e.g. 2.08
  upperBound: number; // e.g. 2.20
  confidence: UpgConfidence;
  readinessBand: UpgReadinessBand;
  /** Standing relative to the ~2.8 appeal line, derived from the interval. */
  admissionStanding: UpgAdmissionStanding;
  explanation: string;
}

/** Human-readable factors behind the estimate, for results-page framing. */
export interface UpgDrivers {
  strongestPositiveSection: string;
  largestDragSection: string;
  highestImpactTopics: string[];
  timePenaltyApplied: boolean;
  completionPenaltyApplied: boolean;
}

export interface MockExamResult extends DiagnosticResult {
  attemptId: string;
  startedAt: number;
  submittedAt: number;
  durationSeconds: number;
  remainingSeconds: number;
  questionReviews: MockQuestionReview[];
  upgEstimate: UpgEstimate;
  upgDrivers: UpgDrivers;
  /** Self-reported HS average used in the UPG blend, if provided. */
  hsAverage?: number;
}
