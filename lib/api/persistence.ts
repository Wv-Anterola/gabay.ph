import type {
  ChoiceId,
  Difficulty,
  MockExamStatus,
  ModuleId,
  ModuleScore,
  ReadinessLevel,
  TopicScore,
} from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";

const MODULE_IDS = ["language", "reading", "math", "science"] as const;
const CHOICE_IDS = ["a", "b", "c", "d"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const READINESS_LEVELS = ["strong", "steady", "needs_work"] as const;
const MOCK_STATUSES = ["in_progress", "submitted"] as const;

const MAX_BODY_BYTES = 1_000_000;
const MAX_IDENTIFIER_LENGTH = 160;
const MAX_DURATION_SECONDS = 12 * 60 * 60;
const MAX_QUESTION_RESPONSES = 500;
const MAX_ANSWERS = 500;
const EARLIEST_TIMESTAMP = Date.UTC(2020, 0, 1);
const LATEST_TIMESTAMP_SKEW_MS = 5 * 60 * 1000;
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export type PersistenceError =
  | "invalid_json"
  | "payload_too_large"
  | "invalid_payload"
  | "database_unavailable"
  | "rate_limited"
  | "persistence_failed";

export type PersistenceResponse = {
  ok: boolean;
  persisted: boolean;
  error?: PersistenceError;
  message: string;
  id?: string;
};

export type ValidationResult<T> = { value: T } | { error: string };

export type WaitlistPayload = {
  email: string;
  gradeLevel: string | null;
  targetYear: string | null;
  paidInterest: boolean;
  referralSource: string | null;
};

export type SessionPayload = {
  clientId: string | null;
  module: ModuleId;
  answers: Record<string, ChoiceId>;
  score: ModuleScore;
  durationMs: number | null;
};

export type ValidatedMockAttempt = {
  attemptId: string;
  status: MockExamStatus;
  startedAt: number;
  submittedAt: number;
  remainingSeconds: number;
};

export type ValidatedMockResult = {
  attemptId: string;
  startedAt: number;
  submittedAt: number;
  durationSeconds: number;
  remainingSeconds: number;
  modules: ModuleScore[];
  overall: {
    correct: number;
    total: number;
    answered: number;
    unanswered: number;
    accuracy: number;
    weightedCorrect?: number;
    weightedTotal?: number;
    weightedAccuracy?: number;
    readinessScore?: number;
    level: ReadinessLevel;
  };
  questionReviews: Array<{
    questionId: string;
    module: ModuleId;
    topic: string;
    difficulty: Difficulty;
    selectedAnswer: ChoiceId | null;
    correctAnswer: ChoiceId;
    isAnswered: boolean;
    isCorrect: boolean;
    isFlagged: boolean;
    timeSpentSeconds: number;
  }>;
};

export type MockAttemptPayload = {
  clientId: string | null;
  attempt: ValidatedMockAttempt;
  result: ValidatedMockResult;
};

export function successResponse(id: string): PersistenceResponse {
  return { ok: true, persisted: true, id, message: "Saved." };
}

export function failureResponse(
  error: PersistenceError,
  message: string,
): PersistenceResponse {
  return { ok: false, persisted: false, error, message };
}

export function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function readJsonObject(
  request: Request,
): Promise<ValidationResult<Record<string, unknown>>> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return { error: "Request body is too large." };
  }

  try {
    const body: unknown = await request.json();
    return isRecord(body) ? { value: body } : { error: "Request body must be an object." };
  } catch {
    return { error: "Request body must be valid JSON." };
  }
}

export function isPayloadTooLargeError(error: string): boolean {
  return error === "Request body is too large.";
}

export function validateWaitlistPayload(
  value: Record<string, unknown>,
): ValidationResult<WaitlistPayload> {
  const email = normalizeEmail(value.email);
  if (!email) return { error: "A valid email address is required." };

  const gradeLevel = optionalText(value.gradeLevel, 40);
  const targetYear = optionalText(value.targetYear, 16);
  const referralSource = optionalText(value.referralSource, 120);
  if (gradeLevel === undefined || targetYear === undefined || referralSource === undefined) {
    return { error: "Optional waitlist fields are invalid." };
  }
  if (value.paidInterest !== undefined && typeof value.paidInterest !== "boolean") {
    return { error: "Paid-interest value is invalid." };
  }

  return {
    value: {
      email,
      gradeLevel,
      targetYear,
      paidInterest: value.paidInterest === true,
      referralSource,
    },
  };
}

export function validateSessionPayload(
  value: Record<string, unknown>,
): ValidationResult<SessionPayload> {
  if (!isModuleId(value.module)) return { error: "Unknown module." };

  const clientId = optionalIdentifier(value.clientId);
  const answers = answerMap(value.answers, MAX_ANSWERS);
  const score = moduleScore(value.score);
  const durationMs = optionalInteger(value.durationMs, 0, MAX_DURATION_SECONDS * 1000);

  if (clientId === undefined || !answers || !score || durationMs === undefined) {
    return { error: "Invalid diagnostic-session payload." };
  }
  if (score.module !== value.module) {
    return { error: "Score module does not match request module." };
  }

  return { value: { clientId, module: value.module, answers, score, durationMs } };
}

export function validateMockAttemptPayload(
  value: Record<string, unknown>,
): ValidationResult<MockAttemptPayload> {
  const clientId = optionalIdentifier(value.clientId);
  const attempt = mockAttempt(value.attempt);
  const result = mockResult(value.result);

  if (clientId === undefined) return { error: "Invalid client identifier." };
  if (!attempt) return { error: "Invalid mock attempt." };
  if (!result) return { error: "Invalid mock result." };
  if (attempt.status !== "submitted") {
    return { error: "Only submitted attempts can be persisted." };
  }
  if (
    attempt.attemptId !== result.attemptId ||
    attempt.startedAt !== result.startedAt ||
    attempt.submittedAt !== result.submittedAt ||
    attempt.remainingSeconds !== result.remainingSeconds
  ) {
    return { error: "Attempt and result do not match." };
  }

  return { value: { clientId, attempt, result } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isModuleId(value: unknown): value is ModuleId {
  return typeof value === "string" && (MODULE_IDS as readonly string[]).includes(value);
}

function isChoiceId(value: unknown): value is ChoiceId {
  return typeof value === "string" && (CHOICE_IDS as readonly string[]).includes(value);
}

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && (DIFFICULTIES as readonly string[]).includes(value);
}

function isReadinessLevel(value: unknown): value is ReadinessLevel {
  return typeof value === "string" && (READINESS_LEVELS as readonly string[]).includes(value);
}

function isMockStatus(value: unknown): value is MockExamStatus {
  return typeof value === "string" && (MOCK_STATUSES as readonly string[]).includes(value);
}

function validIdentifier(value: unknown, maxLength = MAX_IDENTIFIER_LENGTH): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxLength &&
    !value.includes("\u0000") &&
    !UNSAFE_KEYS.has(value)
  );
}

function optionalIdentifier(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  return validIdentifier(value) ? value : undefined;
}

function optionalText(value: unknown, maxLength: number): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || value.length > maxLength || value.includes("\u0000")) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized || null;
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function integer(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
    ? value
    : null;
}

function finiteNumber(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
    ? value
    : null;
}

function optionalInteger(value: unknown, min: number, max: number): number | null | undefined {
  if (value === undefined || value === null) return null;
  return integer(value, min, max) ?? undefined;
}

function timestamp(value: unknown): number | null {
  return integer(value, EARLIEST_TIMESTAMP, Date.now() + LATEST_TIMESTAMP_SKEW_MS);
}

function answerMap(value: unknown, maxEntries: number): Record<string, ChoiceId> | null {
  if (!isRecord(value)) return null;
  const entries = Object.entries(value);
  if (entries.length > maxEntries) return null;

  const answers = Object.create(null) as Record<string, ChoiceId>;
  for (const [questionId, answer] of entries) {
    if (!validIdentifier(questionId) || !isChoiceId(answer)) return null;
    answers[questionId] = answer;
  }
  return answers;
}

function topicScore(value: unknown): TopicScore | null {
  if (!isRecord(value) || !isModuleId(value.module) || !validIdentifier(value.topic)) return null;
  const correct = integer(value.correct, 0, MAX_QUESTION_RESPONSES);
  const total = integer(value.total, 1, MAX_QUESTION_RESPONSES);
  const accuracy = finiteNumber(value.accuracy, 0, 100);
  if (
    correct === null ||
    total === null ||
    correct > total ||
    accuracy === null ||
    !isReadinessLevel(value.level)
  ) {
    return null;
  }
  return {
    module: value.module,
    topic: value.topic,
    correct,
    total,
    accuracy,
    level: value.level,
  };
}

function moduleScore(value: unknown): ModuleScore | null {
  if (!isRecord(value) || !isModuleId(value.module) || !validIdentifier(value.name, 100)) return null;

  const correct = integer(value.correct, 0, MAX_QUESTION_RESPONSES);
  const total = integer(value.total, 1, MAX_QUESTION_RESPONSES);
  const answered = integer(value.answered, 0, MAX_QUESTION_RESPONSES);
  const unanswered = integer(value.unanswered, 0, MAX_QUESTION_RESPONSES);
  const accuracy = finiteNumber(value.accuracy, 0, 100);
  const weightedCorrect = finiteNumber(value.weightedCorrect, 0, MAX_QUESTION_RESPONSES * 2);
  const weightedTotal = finiteNumber(value.weightedTotal, 0, MAX_QUESTION_RESPONSES * 2);
  const weightedAccuracy = finiteNumber(value.weightedAccuracy, 0, 100);
  if (
    correct === null ||
    total === null ||
    answered === null ||
    unanswered === null ||
    accuracy === null ||
    weightedCorrect === null ||
    weightedTotal === null ||
    weightedAccuracy === null ||
    correct > answered ||
    answered + unanswered !== total ||
    weightedCorrect > weightedTotal ||
    !isReadinessLevel(value.level) ||
    !Array.isArray(value.topics) ||
    value.topics.length > 100
  ) {
    return null;
  }

  const topics: TopicScore[] = [];
  for (const item of value.topics) {
    const topic = topicScore(item);
    if (!topic || topic.module !== value.module) return null;
    topics.push(topic);
  }

  return {
    module: value.module,
    name: value.name,
    correct,
    total,
    answered,
    unanswered,
    accuracy,
    weightedCorrect,
    weightedTotal,
    weightedAccuracy,
    level: value.level,
    topics,
  };
}

function mockAttempt(value: unknown): ValidatedMockAttempt | null {
  if (!isRecord(value) || !validIdentifier(value.attemptId) || !isMockStatus(value.status)) return null;
  const startedAt = timestamp(value.startedAt);
  const submittedAt = timestamp(value.submittedAt);
  const remainingSeconds = integer(value.remainingSeconds, 0, MAX_DURATION_SECONDS);
  const answers = answerMap(value.answers, MAX_ANSWERS);
  if (
    startedAt === null ||
    submittedAt === null ||
    submittedAt < startedAt ||
    remainingSeconds === null ||
    !answers ||
    !validMockExamState(value)
  ) {
    return null;
  }

  return {
    attemptId: value.attemptId,
    status: value.status,
    startedAt,
    submittedAt,
    remainingSeconds,
  };
}

function validMockExamState(value: Record<string, unknown>): boolean {
  if (
    !Array.isArray(value.flaggedQuestionIds) ||
    value.flaggedQuestionIds.length > MAX_QUESTION_RESPONSES ||
    !isRecord(value.questionTimeSpentSeconds) ||
    !Array.isArray(value.sectionOrder) ||
    value.sectionOrder.length === 0 ||
    value.sectionOrder.length > MODULE_IDS.length ||
    !isRecord(value.questionIdsBySection)
  ) {
    return false;
  }

  const sections = new Set<ModuleId>();
  for (const section of value.sectionOrder) {
    if (!isModuleId(section) || sections.has(section)) return false;
    sections.add(section);
  }
  for (const questionId of value.flaggedQuestionIds) {
    if (!validIdentifier(questionId)) return false;
  }
  for (const [questionId, spent] of Object.entries(value.questionTimeSpentSeconds)) {
    if (!validIdentifier(questionId) || integer(spent, 0, MAX_DURATION_SECONDS) === null) return false;
  }
  for (const section of sections) {
    const ids = value.questionIdsBySection[section];
    if (
      !Array.isArray(ids) ||
      ids.length > MAX_QUESTION_RESPONSES ||
      !ids.every((id) => validIdentifier(id))
    ) {
      return false;
    }
  }
  return optionalIdentifier(value.bankId) !== undefined && optionalInteger(value.hsAverage, 0, 100) !== undefined;
}

function mockResult(value: unknown): ValidatedMockResult | null {
  if (!isRecord(value) || !validIdentifier(value.attemptId)) return null;
  const startedAt = timestamp(value.startedAt);
  const submittedAt = timestamp(value.submittedAt);
  const durationSeconds = integer(value.durationSeconds, 0, MAX_DURATION_SECONDS);
  const remainingSeconds = integer(value.remainingSeconds, 0, MAX_DURATION_SECONDS);
  const overall = overallScore(value.overall);
  if (
    startedAt === null ||
    submittedAt === null ||
    submittedAt < startedAt ||
    durationSeconds === null ||
    remainingSeconds === null ||
    !overall ||
    !Array.isArray(value.modules) ||
    value.modules.length === 0 ||
    value.modules.length > MODULE_IDS.length ||
    !Array.isArray(value.questionReviews) ||
    value.questionReviews.length === 0 ||
    value.questionReviews.length > MAX_QUESTION_RESPONSES
  ) {
    return null;
  }

  const modules: ModuleScore[] = [];
  const moduleIds = new Set<ModuleId>();
  for (const item of value.modules) {
    const score = moduleScore(item);
    if (!score || moduleIds.has(score.module)) return null;
    moduleIds.add(score.module);
    modules.push(score);
  }

  const questionReviews: ValidatedMockResult["questionReviews"] = [];
  const questionIds = new Set<string>();
  for (const item of value.questionReviews) {
    const review = questionReview(item);
    if (!review || questionIds.has(review.questionId)) return null;
    questionIds.add(review.questionId);
    questionReviews.push(review);
  }

  const moduleTotal = modules.reduce((sum, score) => sum + score.total, 0);
  if (overall.total !== questionReviews.length || overall.total !== moduleTotal) return null;

  return {
    attemptId: value.attemptId,
    startedAt,
    submittedAt,
    durationSeconds,
    remainingSeconds,
    modules,
    overall,
    questionReviews,
  };
}

function overallScore(value: unknown): ValidatedMockResult["overall"] | null {
  if (!isRecord(value)) return null;
  const correct = integer(value.correct, 0, MAX_QUESTION_RESPONSES);
  const total = integer(value.total, 1, MAX_QUESTION_RESPONSES);
  const answered = integer(value.answered, 0, MAX_QUESTION_RESPONSES);
  const unanswered = integer(value.unanswered, 0, MAX_QUESTION_RESPONSES);
  const accuracy = finiteNumber(value.accuracy, 0, 100);
  const weightedCorrect = optionalNumber(value.weightedCorrect, 0, MAX_QUESTION_RESPONSES * 2);
  const weightedTotal = optionalNumber(value.weightedTotal, 0, MAX_QUESTION_RESPONSES * 2);
  const weightedAccuracy = optionalNumber(value.weightedAccuracy, 0, 100);
  const readinessScore = optionalNumber(value.readinessScore, 0, 100);

  if (
    correct === null ||
    total === null ||
    answered === null ||
    unanswered === null ||
    accuracy === null ||
    weightedCorrect === undefined ||
    weightedTotal === undefined ||
    weightedAccuracy === undefined ||
    readinessScore === undefined ||
    correct > answered ||
    answered + unanswered !== total ||
    (weightedCorrect !== null && weightedTotal !== null && weightedCorrect > weightedTotal) ||
    !isReadinessLevel(value.level)
  ) {
    return null;
  }

  return {
    correct,
    total,
    answered,
    unanswered,
    accuracy,
    ...(weightedCorrect === null ? {} : { weightedCorrect }),
    ...(weightedTotal === null ? {} : { weightedTotal }),
    ...(weightedAccuracy === null ? {} : { weightedAccuracy }),
    ...(readinessScore === null ? {} : { readinessScore }),
    level: value.level,
  };
}

function optionalNumber(value: unknown, min: number, max: number): number | null | undefined {
  if (value === undefined || value === null) return null;
  return finiteNumber(value, min, max) ?? undefined;
}

function questionReview(value: unknown): ValidatedMockResult["questionReviews"][number] | null {
  if (
    !isRecord(value) ||
    !validIdentifier(value.questionId) ||
    !isModuleId(value.module) ||
    !validIdentifier(value.topic) ||
    !isDifficulty(value.difficulty) ||
    !isChoiceId(value.correctAnswer) ||
    (value.selectedAnswer !== undefined && value.selectedAnswer !== null && !isChoiceId(value.selectedAnswer)) ||
    typeof value.isAnswered !== "boolean" ||
    typeof value.isCorrect !== "boolean" ||
    typeof value.isFlagged !== "boolean"
  ) {
    return null;
  }
  const timeSpentSeconds = integer(value.timeSpentSeconds, 0, MAX_DURATION_SECONDS);
  if (timeSpentSeconds === null || (value.isAnswered && value.selectedAnswer === undefined)) return null;

  return {
    questionId: value.questionId,
    module: value.module,
    topic: value.topic,
    difficulty: value.difficulty,
    selectedAnswer: value.selectedAnswer ?? null,
    correctAnswer: value.correctAnswer,
    isAnswered: value.isAnswered,
    isCorrect: value.isCorrect,
    isFlagged: value.isFlagged,
    timeSpentSeconds,
  };
}
