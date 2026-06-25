"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import ClayModal from "@/app/components/ui/ClayModal";
import ClayButton from "@/app/components/ui/ClayButton";

/**
 * Submit confirmation. Surfaces how many questions are still unanswered so the
 * student can go back, but never blocks submission (unanswered = no credit).
 */
export default function SubmitConfirm({
  open,
  unansweredCount,
  total,
  onClose,
  onConfirm,
  submitting,
}: {
  open: boolean;
  unansweredCount: number;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}) {
  const allAnswered = unansweredCount === 0;

  return (
    <ClayModal
      open={open}
      onClose={onClose}
      title="Submit this module?"
      footer={
        <>
          <ClayButton variant="secondary" onClick={onClose} disabled={submitting}>
            Keep answering
          </ClayButton>
          <ClayButton variant="berry" onClick={onConfirm} disabled={submitting}>
            {submitting ? "Scoring…" : "Submit & see results"}
          </ClayButton>
        </>
      }
    >
      {allAnswered ? (
        <div className="flex items-start gap-3">
          <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-state-strong" strokeWidth={2} />
          <p>
            You answered all {total} questions. Submit to see your readiness signal and weak topics.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-state-steady" strokeWidth={2} />
          <p>
            You still have{" "}
            <span className="font-bold text-ink tabular">{unansweredCount}</span> of {total}{" "}
            unanswered. Unanswered questions are marked as not correct. You can go back, or submit
            now anyway.
          </p>
        </div>
      )}
    </ClayModal>
  );
}
