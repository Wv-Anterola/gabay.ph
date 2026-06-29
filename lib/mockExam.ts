import {
  MODULES,
  MODULE_ORDER,
  getActiveBank,
  getModuleQuestions,
  getQuestionById,
} from "@/lib/questions";
import type { MockExamAttempt, ModuleId, Question } from "@/lib/types";

export const MOCK_EXAM_SECTION_ORDER: ModuleId[] = [...MODULE_ORDER];

export function getMockExamSections(
  bankId: string = getActiveBank().id,
): Array<{ module: ModuleId; questions: Question[] }> {
  return MOCK_EXAM_SECTION_ORDER.map((module) => ({
    module,
    questions: getModuleQuestions(module, bankId),
  }));
}

export function getMockQuestionIdsBySection(
  bankId: string = getActiveBank().id,
): Record<ModuleId, string[]> {
  return Object.fromEntries(
    getMockExamSections(bankId).map(({ module, questions }) => [
      module,
      questions.map((q) => q.id),
    ]),
  ) as Record<ModuleId, string[]>;
}

export function getMockQuestionsByModule(
  bankId: string = getActiveBank().id,
): Record<ModuleId, Question[]> {
  return Object.fromEntries(
    getMockExamSections(bankId).map(({ module, questions }) => [module, questions]),
  ) as Record<ModuleId, Question[]>;
}

export function getMockExamTotalSeconds(): number {
  return MOCK_EXAM_SECTION_ORDER.reduce(
    (seconds, module) => seconds + MODULES[module].estimatedMinutes * 60,
    0,
  );
}

export function getMockExamQuestionCount(bankId: string = getActiveBank().id): number {
  return getMockExamSections(bankId).reduce(
    (sum, section) => sum + section.questions.length,
    0,
  );
}

export function getAttemptQuestion(
  attempt: MockExamAttempt,
): { module: ModuleId; question: Question } | null {
  const sectionModule = attempt.sectionOrder[attempt.currentSectionIndex];
  const questionId = sectionModule
    ? attempt.questionIdsBySection[sectionModule]?.[attempt.currentQuestionIndex]
    : undefined;
  const question = questionId ? getQuestionById(questionId) : undefined;
  return sectionModule && question ? { module: sectionModule, question } : null;
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
