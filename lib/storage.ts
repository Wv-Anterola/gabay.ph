"use client";

import { MODULE_ORDER } from "@/lib/questions";
import type {
  AnswerMap,
  DiagnosticResult,
  MockExamAttempt,
  MockExamResult,
  ModuleId,
  StoredModuleAttempt,
} from "@/lib/types";

/**
 * localStorage persistence for no-login exam continuity.
 * Public keys moved from `gabay-*` to `tero-*`; reads migrate legacy values.
 */

const LEGACY_ATTEMPT_PREFIX = "gabay-attempt-";
const LEGACY_RESULT_KEY = "gabay-result";
const LEGACY_CLIENT_ID_KEY = "gabay-client-id";

const ATTEMPT_PREFIX = "tero-attempt-";
const RESULT_KEY = "tero-result";
const CLIENT_ID_KEY = "tero-client-id";
const MOCK_ATTEMPTS_KEY = "tero-mock-attempts";
const MOCK_RESULT_PREFIX = "tero-mock-result-";
const CURRENT_MOCK_ATTEMPT_KEY = "tero-current-mock-attempt";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / serialization errors */
  }
}

function migrateScalarKey(from: string, to: string): void {
  if (!hasWindow()) return;
  if (window.localStorage.getItem(to) !== null) return;
  const legacy = window.localStorage.getItem(from);
  if (legacy !== null) window.localStorage.setItem(to, legacy);
}

function migrateStorageKeys(): void {
  if (!hasWindow()) return;
  migrateScalarKey(LEGACY_CLIENT_ID_KEY, CLIENT_ID_KEY);
  migrateScalarKey(LEGACY_RESULT_KEY, RESULT_KEY);

  MODULE_ORDER.forEach((module) => {
    migrateScalarKey(LEGACY_ATTEMPT_PREFIX + module, ATTEMPT_PREFIX + module);
  });
}

/** Stable anonymous id for this browser (not personally identifying). */
export function getClientId(): string {
  if (!hasWindow()) return "server";
  migrateStorageKeys();
  let id = window.localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `c_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function loadAttempt(module: ModuleId): StoredModuleAttempt | null {
  migrateStorageKeys();
  return readJson<StoredModuleAttempt>(ATTEMPT_PREFIX + module);
}

export function saveAttempt(attempt: StoredModuleAttempt): void {
  writeJson(ATTEMPT_PREFIX + attempt.module, attempt);
}

export function updateAttemptAnswers(
  module: ModuleId,
  questionIds: string[],
  answers: AnswerMap,
  startedAt: number,
): void {
  saveAttempt({ module, questionIds, answers, startedAt });
}

export function completeAttempt(module: ModuleId): void {
  const existing = loadAttempt(module);
  if (existing) {
    saveAttempt({ ...existing, completedAt: Date.now() });
  }
}

export function getCompletedModules(): ModuleId[] {
  if (!hasWindow()) return [];
  migrateStorageKeys();
  return MODULE_ORDER.filter((m) => loadAttempt(m)?.completedAt);
}

export function saveResult(result: DiagnosticResult): void {
  writeJson(RESULT_KEY, result);
}

export function loadResult(): DiagnosticResult | null {
  migrateStorageKeys();
  return readJson<DiagnosticResult>(RESULT_KEY);
}

export function clearDiagnostic(): void {
  if (!hasWindow()) return;
  migrateStorageKeys();
  MODULE_ORDER.forEach((m) => window.localStorage.removeItem(ATTEMPT_PREFIX + m));
  window.localStorage.removeItem(RESULT_KEY);
}

function createId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${suffix}`;
}

export function computeResumedRemainingSeconds(
  remainingSeconds: number,
  lastSavedAt: number,
  now = Date.now(),
): number {
  const elapsed = Math.max(0, Math.floor((now - lastSavedAt) / 1000));
  return Math.max(0, remainingSeconds - elapsed);
}

function currentQuestionId(attempt: MockExamAttempt): string | undefined {
  const sectionModule = attempt.sectionOrder[attempt.currentSectionIndex];
  return sectionModule
    ? attempt.questionIdsBySection[sectionModule]?.[attempt.currentQuestionIndex]
    : undefined;
}

export function resumeAttemptClock(
  attempt: MockExamAttempt,
  now = Date.now(),
): MockExamAttempt {
  if (attempt.status !== "in_progress") return attempt;
  const elapsed = Math.max(0, Math.floor((now - attempt.lastSavedAt) / 1000));
  if (elapsed === 0) return attempt;

  const questionId = currentQuestionId(attempt);
  const questionTimeSpentSeconds = { ...attempt.questionTimeSpentSeconds };
  if (questionId) {
    questionTimeSpentSeconds[questionId] =
      (questionTimeSpentSeconds[questionId] ?? 0) + elapsed;
  }

  return {
    ...attempt,
    remainingSeconds: computeResumedRemainingSeconds(
      attempt.remainingSeconds,
      attempt.lastSavedAt,
      now,
    ),
    lastSavedAt: now,
    questionTimeSpentSeconds,
  };
}

export function createMockExamAttempt(
  questionIdsBySection: Record<ModuleId, string[]>,
  totalSeconds: number,
): MockExamAttempt {
  const now = Date.now();
  return {
    attemptId: createId("attempt"),
    status: "in_progress",
    startedAt: now,
    currentSectionIndex: 0,
    currentQuestionIndex: 0,
    remainingSeconds: totalSeconds,
    lastSavedAt: now,
    answers: {},
    flaggedQuestionIds: [],
    questionTimeSpentSeconds: {},
    sectionOrder: [...MODULE_ORDER],
    questionIdsBySection,
  };
}

export function loadMockAttempts(): MockExamAttempt[] {
  migrateStorageKeys();
  return readJson<MockExamAttempt[]>(MOCK_ATTEMPTS_KEY) ?? [];
}

export function saveMockAttempt(attempt: MockExamAttempt): void {
  if (!hasWindow()) return;
  const attempts = loadMockAttempts();
  const next = [
    attempt,
    ...attempts.filter((existing) => existing.attemptId !== attempt.attemptId),
  ].sort((a, b) => b.startedAt - a.startedAt);
  writeJson(MOCK_ATTEMPTS_KEY, next);
  if (attempt.status === "in_progress") {
    window.localStorage.setItem(CURRENT_MOCK_ATTEMPT_KEY, attempt.attemptId);
  }
}

export function loadMockAttempt(attemptId: string): MockExamAttempt | null {
  const attempt = loadMockAttempts().find((item) => item.attemptId === attemptId) ?? null;
  if (!attempt) return null;
  const resumed = resumeAttemptClock(attempt);
  if (resumed !== attempt) saveMockAttempt(resumed);
  return resumed;
}

export function getCurrentMockAttempt(): MockExamAttempt | null {
  if (!hasWindow()) return null;
  migrateStorageKeys();
  const currentId = window.localStorage.getItem(CURRENT_MOCK_ATTEMPT_KEY);
  const attempts = loadMockAttempts();
  const attempt =
    (currentId ? attempts.find((item) => item.attemptId === currentId) : undefined) ??
    attempts.find((item) => item.status === "in_progress") ??
    null;
  if (!attempt) return null;
  const resumed = resumeAttemptClock(attempt);
  if (resumed !== attempt) saveMockAttempt(resumed);
  return resumed;
}

export function setCurrentMockAttemptId(attemptId: string): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(CURRENT_MOCK_ATTEMPT_KEY, attemptId);
}

export function saveMockResult(result: MockExamResult): void {
  writeJson(MOCK_RESULT_PREFIX + result.attemptId, result);
  saveResult(result);
}

export function loadMockResult(attemptId: string): MockExamResult | null {
  return readJson<MockExamResult>(MOCK_RESULT_PREFIX + attemptId);
}

export function loadLatestMockResult(): MockExamResult | null {
  const submitted = loadMockAttempts()
    .filter((attempt) => attempt.status === "submitted")
    .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0))[0];
  return submitted ? loadMockResult(submitted.attemptId) : null;
}

export function clearCurrentMockAttempt(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(CURRENT_MOCK_ATTEMPT_KEY);
}
