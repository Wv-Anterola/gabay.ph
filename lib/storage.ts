"use client";

import type {
  AnswerMap,
  DiagnosticResult,
  ModuleId,
  StoredModuleAttempt,
} from "@/lib/types";

/**
 * localStorage persistence for instant, no-login diagnostic continuity.
 * All functions are SSR-safe (no-op / null on the server).
 */

const ATTEMPT_PREFIX = "gabay-attempt-";
const RESULT_KEY = "gabay-result";
const CLIENT_ID_KEY = "gabay-client-id";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

/** Stable anonymous id for this browser (not personally identifying). */
export function getClientId(): string {
  if (!hasWindow()) return "server";
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
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(ATTEMPT_PREFIX + module);
    return raw ? (JSON.parse(raw) as StoredModuleAttempt) : null;
  } catch {
    return null;
  }
}

export function saveAttempt(attempt: StoredModuleAttempt): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(ATTEMPT_PREFIX + attempt.module, JSON.stringify(attempt));
  } catch {
    /* ignore quota / serialization errors */
  }
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
  const modules: ModuleId[] = ["language", "reading", "math", "science"];
  return modules.filter((m) => loadAttempt(m)?.completedAt);
}

export function saveResult(result: DiagnosticResult): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(RESULT_KEY, JSON.stringify(result));
  } catch {
    /* ignore */
  }
}

export function loadResult(): DiagnosticResult | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as DiagnosticResult) : null;
  } catch {
    return null;
  }
}

export function clearDiagnostic(): void {
  if (!hasWindow()) return;
  const modules: ModuleId[] = ["language", "reading", "math", "science"];
  modules.forEach((m) => window.localStorage.removeItem(ATTEMPT_PREFIX + m));
  window.localStorage.removeItem(RESULT_KEY);
}
