"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QuestionCard from "./QuestionCard";
import ProgressRail from "./ProgressRail";
import QuizFooterNav from "./QuizFooterNav";
import SubmitConfirm from "./SubmitConfirm";
import { MODULES, getModuleQuestions } from "@/lib/questions";
import { scoreModule, buildResult } from "@/lib/scoring";
import {
  getClientId,
  loadAttempt,
  saveAttempt,
  completeAttempt,
  saveResult,
} from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import type { AnswerMap, ChoiceId, ModuleId, ModuleScore, Question } from "@/lib/types";

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ModuleRunner({
  module,
  questions,
}: {
  module: ModuleId;
  questions: Question[];
}) {
  const router = useRouter();
  const meta = MODULES[module];
  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(Date.now());

  // Restore any in-progress attempt and start the (soft) timer.
  useEffect(() => {
    const existing = loadAttempt(module);
    if (existing && !existing.completedAt) {
      setAnswers(existing.answers ?? {});
      startRef.current = existing.startedAt ?? Date.now();
    } else {
      startRef.current = Date.now();
      saveAttempt({ module, questionIds, answers: {}, startedAt: startRef.current });
    }
    trackEvent("module_started", { module });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
    return () => window.clearInterval(id);
  }, []);

  const persist = useCallback(
    (next: AnswerMap) => {
      saveAttempt({ module, questionIds, answers: next, startedAt: startRef.current });
    },
    [module, questionIds],
  );

  const onSelect = useCallback(
    (id: ChoiceId) => {
      const q = questions[current];
      setAnswers((prev) => {
        const next = { ...prev, [q.id]: id };
        persist(next);
        return next;
      });
    },
    [current, questions, persist],
  );

  const answeredIds = useMemo(() => new Set(Object.keys(answers)), [answers]);
  const unansweredCount = questions.length - answeredIds.size;

  const goNext = () => setCurrent((c) => Math.min(c + 1, questions.length - 1));
  const goPrev = () => setCurrent((c) => Math.max(c - 1, 0));

  async function handleConfirmSubmit() {
    setSubmitting(true);
    const durationMs = Date.now() - startRef.current;

    // Score this module and persist completion.
    const thisScore = scoreModule(module, questions, answers);
    completeAttempt(module);

    // Build a combined result across every module completed so far.
    const moduleScores: ModuleScore[] = [];
    (Object.keys(MODULES) as ModuleId[]).forEach((m) => {
      const attempt = loadAttempt(m);
      if (attempt?.completedAt || m === module) {
        const qs = getModuleQuestions(m);
        const ans = m === module ? answers : (attempt?.answers ?? {});
        if (qs.length > 0 && (m === module || attempt?.completedAt)) {
          moduleScores.push(scoreModule(m, qs, ans));
        }
      }
    });

    const result = buildResult(moduleScores);
    saveResult(result);

    trackEvent("module_completed", { module, accuracy: thisScore.accuracy });
    trackEvent("diagnostic_completed", {
      modules_completed: moduleScores.length,
      overall_accuracy: result.overall.accuracy,
    });

    // Best-effort database save (works only if DATABASE_URL is configured).
    try {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: getClientId(),
          module,
          answers,
          score: thisScore,
          durationMs,
        }),
      });
    } catch {
      /* offline / no DB — localStorage already holds the result */
    }

    router.push("/results");
  }

  const q = questions[current];

  return (
    <div className="mx-auto max-w-wide px-5 py-8 lg:px-8 lg:py-12">
      <div className="flex items-center justify-between">
        <Link
          href="/diagnostic"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-berry"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={2} />
          All modules
        </Link>
        <span className="rounded-full border border-clay-line bg-clay px-3 py-1 text-xs font-bold text-ink">
          {meta.name}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <QuestionCard
            question={q}
            index={current}
            total={questions.length}
            selected={answers[q.id]}
            onSelect={onSelect}
          />
          <QuizFooterNav
            canPrev={current > 0}
            isLast={current === questions.length - 1}
            onPrev={goPrev}
            onNext={goNext}
            onSubmit={() => setConfirmOpen(true)}
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProgressRail
            total={questions.length}
            current={current}
            answeredIds={answeredIds}
            questionIds={questionIds}
            onJump={setCurrent}
            elapsedLabel={formatElapsed(elapsed)}
          />
        </div>
      </div>

      <SubmitConfirm
        open={confirmOpen}
        unansweredCount={unansweredCount}
        total={questions.length}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        submitting={submitting}
      />
    </div>
  );
}
