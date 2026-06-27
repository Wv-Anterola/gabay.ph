"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Flag, Send } from "lucide-react";
import ClayButton from "@/app/components/ui/ClayButton";
import ClayModal from "@/app/components/ui/ClayModal";
import QuestionCard from "./QuestionCard";
import ProgressRail from "./ProgressRail";
import QuizFooterNav from "./QuizFooterNav";
import { cn } from "@/lib/cn";
import { MODULES } from "@/lib/questions";
import {
  MOCK_EXAM_SECTION_ORDER,
  formatDuration,
  getMockExamTotalSeconds,
  getMockQuestionIdsBySection,
  getMockQuestionsByModule,
} from "@/lib/mockExam";
import { buildMockExamResult } from "@/lib/scoring";
import {
  createMockExamAttempt,
  getClientId,
  getCurrentMockAttempt,
  saveMockAttempt,
  saveMockResult,
} from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import type { AnswerMap, ChoiceId, MockExamAttempt, ModuleId, Question } from "@/lib/types";

type Section = { module: ModuleId; questions: Question[] };

function currentQuestionId(attempt: MockExamAttempt): string | undefined {
  const sectionModule = attempt.sectionOrder[attempt.currentSectionIndex];
  return sectionModule
    ? attempt.questionIdsBySection[sectionModule]?.[attempt.currentQuestionIndex]
    : undefined;
}

const HS_YEARS = [
  { key: "g8", label: "G8" },
  { key: "g9", label: "G9" },
  { key: "g10", label: "G10" },
  { key: "g11", label: "G11" },
] as const;

type HsGrades = Record<(typeof HS_YEARS)[number]["key"], string>;

const EMPTY_HS_GRADES: HsGrades = { g8: "", g9: "", g10: "", g11: "" };

/** Average the valid (60–100) HS grade entries; undefined if none are usable. */
function averageHsGrades(grades: HsGrades): number | undefined {
  const nums = Object.values(grades)
    .map((v) => Number.parseFloat(v))
    .filter((n) => Number.isFinite(n) && n >= 60 && n <= 100);
  if (nums.length === 0) return undefined;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

export default function MockExamRunner({ sections }: { sections: Section[] }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<MockExamAttempt | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [navDir, setNavDir] = useState<"next" | "prev">("next");
  const [hsGrades, setHsGrades] = useState<HsGrades>(EMPTY_HS_GRADES);

  const sectionsByModule = useMemo(
    () => Object.fromEntries(sections.map((s) => [s.module, s])) as Record<ModuleId, Section>,
    [sections],
  );
  const allQuestionIds = useMemo(
    () => sections.flatMap((section) => section.questions.map((q) => q.id)),
    [sections],
  );

  useEffect(() => {
    const existing = getCurrentMockAttempt();
    if (existing?.status === "in_progress") {
      setAttempt(existing);
      return;
    }
    const next = createMockExamAttempt(getMockQuestionIdsBySection(), getMockExamTotalSeconds());
    saveMockAttempt(next);
    setAttempt(next);
  }, []);

  function persist(next: MockExamAttempt) {
    setAttempt(next);
    saveMockAttempt(next);
  }

  function updateAttempt(mutator: (current: MockExamAttempt) => MockExamAttempt) {
    setAttempt((current) => {
      if (!current || current.status !== "in_progress") return current;
      const next = mutator(current);
      saveMockAttempt(next);
      return next;
    });
  }

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress" || submitting) return;
    const id = window.setInterval(() => {
      updateAttempt((current) => {
        const now = Date.now();
        const elapsed = Math.max(1, Math.floor((now - current.lastSavedAt) / 1000));
        const questionId = currentQuestionId(current);
        const questionTimeSpentSeconds = { ...current.questionTimeSpentSeconds };
        if (questionId) {
          questionTimeSpentSeconds[questionId] =
            (questionTimeSpentSeconds[questionId] ?? 0) + elapsed;
        }
        return {
          ...current,
          remainingSeconds: Math.max(0, current.remainingSeconds - elapsed),
          lastSavedAt: now,
          questionTimeSpentSeconds,
        };
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.attemptId, attempt?.status, submitting]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress" || attempt.remainingSeconds > 0) return;
    void submitAttempt("timer");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.remainingSeconds, attempt?.status]);

  if (!attempt) {
    return <div className="mx-auto max-w-content px-5 py-24 text-center text-ink-muted">Loading…</div>;
  }

  const sectionModule = attempt.sectionOrder[attempt.currentSectionIndex];
  const section = sectionsByModule[sectionModule];
  const question = section.questions[attempt.currentQuestionIndex];
  const allAnsweredIds = new Set(Object.keys(attempt.answers));
  const sectionQuestionIds = section.questions.map((q) => q.id);
  const answeredIds = new Set(sectionQuestionIds.filter((id) => allAnsweredIds.has(id)));
  const flaggedIds = new Set(attempt.flaggedQuestionIds);
  const unansweredCount = allQuestionIds.filter((id) => !allAnsweredIds.has(id)).length;
  const isLastQuestion = attempt.currentQuestionIndex === section.questions.length - 1;
  const isLastSection = attempt.currentSectionIndex === attempt.sectionOrder.length - 1;
  const overallAnswered = allQuestionIds.length - unansweredCount;

  function onSelect(id: ChoiceId) {
    updateAttempt((current) => ({
      ...current,
      answers: { ...current.answers, [question.id]: id },
      lastSavedAt: Date.now(),
    }));
  }

  function toggleFlag() {
    updateAttempt((current) => {
      const exists = current.flaggedQuestionIds.includes(question.id);
      return {
        ...current,
        flaggedQuestionIds: exists
          ? current.flaggedQuestionIds.filter((id) => id !== question.id)
          : [...current.flaggedQuestionIds, question.id],
        lastSavedAt: Date.now(),
      };
    });
  }

  function goPrev() {
    setNavDir("prev");
    updateAttempt((current) => {
      if (current.currentQuestionIndex > 0) {
        return {
          ...current,
          currentQuestionIndex: current.currentQuestionIndex - 1,
          lastSavedAt: Date.now(),
        };
      }
      if (current.currentSectionIndex === 0) return current;
      const prevModule = current.sectionOrder[current.currentSectionIndex - 1];
      return {
        ...current,
        currentSectionIndex: current.currentSectionIndex - 1,
        currentQuestionIndex: current.questionIdsBySection[prevModule].length - 1,
        lastSavedAt: Date.now(),
      };
    });
  }

  function goNext() {
    setNavDir("next");
    if (!isLastQuestion) {
      updateAttempt((current) => ({
        ...current,
        currentQuestionIndex: current.currentQuestionIndex + 1,
        lastSavedAt: Date.now(),
      }));
      return;
    }
    if (!isLastSection) {
      setTransitionOpen(true);
      return;
    }
    setConfirmOpen(true);
  }

  function continueToNextSection() {
    updateAttempt((current) => ({
      ...current,
      currentSectionIndex: Math.min(current.currentSectionIndex + 1, current.sectionOrder.length - 1),
      currentQuestionIndex: 0,
      lastSavedAt: Date.now(),
    }));
    setTransitionOpen(false);
  }

  function jumpToQuestion(index: number) {
    setNavDir(index >= attempt!.currentQuestionIndex ? "next" : "prev");
    updateAttempt((current) => ({
      ...current,
      currentQuestionIndex: index,
      lastSavedAt: Date.now(),
    }));
  }

  async function submitAttempt(reason: "manual" | "timer") {
    const currentAttempt = attempt;
    if (submitting || !currentAttempt) return;
    setSubmitting(true);
    const submittedAt = Date.now();
    const hsAverage =
      reason === "timer" ? currentAttempt.hsAverage : averageHsGrades(hsGrades);
    const submitted: MockExamAttempt = {
      ...currentAttempt,
      status: "submitted",
      submittedAt,
      lastSavedAt: submittedAt,
      remainingSeconds: reason === "timer" ? 0 : currentAttempt.remainingSeconds,
      hsAverage,
    };
    const result = buildMockExamResult(submitted, getMockQuestionsByModule());
    persist(submitted);
    saveMockResult(result);
    trackEvent("diagnostic_completed", {
      attempt_id: submitted.attemptId,
      reason,
      readiness_score: result.overall.readinessScore ?? result.overall.accuracy,
    });

    try {
      await fetch("/api/mock-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: getClientId(),
          attempt: submitted,
          result,
        }),
      });
    } catch {
      /* localStorage result is already saved */
    }

    router.push(`/results?attemptId=${submitted.attemptId}`);
  }

  const nextSection =
    attempt.currentSectionIndex + 1 < attempt.sectionOrder.length
      ? MODULES[attempt.sectionOrder[attempt.currentSectionIndex + 1]]
      : null;

  return (
    <div className="mx-auto max-w-wide px-5 py-8 lg:px-8 lg:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/diagnostic"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-berry"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={2} />
          Exam start
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "tabular inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold transition-colors",
              attempt.remainingSeconds <= 60
                ? "animate-pulse-soft border-berry bg-berry text-white"
                : attempt.remainingSeconds <= 300
                  ? "border-mango bg-mango-tint text-mango-deep"
                  : "border-clay-line bg-clay text-ink",
            )}
          >
            <Clock aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
            {formatDuration(attempt.remainingSeconds)}
          </span>
          <span className="tabular rounded-xl border border-clay-line bg-clay px-3 py-1 text-xs font-bold text-ink">
            {overallAnswered}/{allQuestionIds.length} answered
          </span>
        </div>
      </div>

      <div
        key={sectionModule}
        className="mt-5 animate-fade-up rounded-clay border border-clay-line bg-cream px-5 py-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-mango-deep">
              Section {attempt.currentSectionIndex + 1} of {attempt.sectionOrder.length}
            </p>
            <h1 className="mt-1 text-xl font-bold text-ink">{MODULES[sectionModule].name}</h1>
          </div>
          <span className="tabular text-sm font-semibold text-ink-muted">
            Question {attempt.currentQuestionIndex + 1} of {section.questions.length}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <QuestionCard
            key={question.id}
            className={navDir === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}
            question={question}
            index={attempt.currentQuestionIndex}
            total={section.questions.length}
            selected={attempt.answers[question.id]}
            flagged={flaggedIds.has(question.id)}
            onSelect={onSelect}
            onToggleFlag={toggleFlag}
          />
          <QuizFooterNav
            canPrev={attempt.currentSectionIndex > 0 || attempt.currentQuestionIndex > 0}
            isLast={isLastQuestion}
            onPrev={goPrev}
            onNext={goNext}
            onSubmit={() => (isLastSection ? setConfirmOpen(true) : setTransitionOpen(true))}
            submitLabel={isLastSection ? "Review & submit" : "Next section"}
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProgressRail
            total={section.questions.length}
            current={attempt.currentQuestionIndex}
            answeredIds={answeredIds}
            flaggedIds={flaggedIds}
            questionIds={section.questions.map((q) => q.id)}
            onJump={jumpToQuestion}
            elapsedLabel={`left ${formatDuration(attempt.remainingSeconds)}`}
          />
        </div>
      </div>

      <ClayModal
        open={transitionOpen}
        onClose={() => setTransitionOpen(false)}
        title={`${MODULES[sectionModule].shortName} section complete`}
        footer={
          <>
            <ClayButton variant="secondary" onClick={() => setTransitionOpen(false)}>
              Review this section
            </ClayButton>
            <ClayButton variant="primary" onClick={continueToNextSection}>
              Continue
              <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
            </ClayButton>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-state-strong" />
          <p>
            You reached the end of {MODULES[sectionModule].name}.{" "}
            {nextSection ? `Next up: ${nextSection.name}.` : "Submit when you are ready."}
          </p>
        </div>
      </ClayModal>

      <ClayModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit the full mock exam?"
        footer={
          <>
            <ClayButton variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Keep reviewing
            </ClayButton>
            <ClayButton variant="berry" onClick={() => submitAttempt("manual")} disabled={submitting}>
              <Send aria-hidden className="h-4 w-4" strokeWidth={2} />
              {submitting ? "Submitting..." : "Submit & get estimated UPG"}
            </ClayButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Flag aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-state-steady" />
            <p>
              {unansweredCount === 0
                ? "All questions have an answer. Once submitted, we'll generate your readiness score, topic breakdown, and estimated UPG."
                : `You have ${unansweredCount} unanswered question${unansweredCount === 1 ? "" : "s"}. These will count as incorrect and may raise (worsen) your estimated UPG.`}
            </p>
          </div>

          <div className="rounded-clay border border-clay-line bg-clay px-4 py-3">
            <p className="text-sm font-bold text-ink">High school grades (optional)</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              Your UPG estimate blends 40% of your HS average with 60% of your mock score. Enter
              your general average per year for a closer estimate.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {HS_YEARS.map(({ key, label }) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-ink-muted">{label}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={60}
                    max={100}
                    placeholder="90"
                    value={hsGrades[key]}
                    onChange={(e) =>
                      setHsGrades((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="tabular w-full rounded-xl border border-clay-line bg-cream px-2.5 py-1.5 text-sm font-semibold text-ink outline-none focus:border-berry-soft"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </ClayModal>
    </div>
  );
}
