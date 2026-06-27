"use client";

import { useState } from "react";
import { Mail, Loader2, AlertTriangle } from "lucide-react";
import ClayInput from "@/app/components/ui/ClayInput";
import WaitlistSuccess from "./WaitlistSuccess";
import { trackEvent } from "@/lib/analytics";
import { getClientId } from "@/lib/storage";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GRADE_OPTIONS = ["Grade 11", "Grade 12", "Gap year", "Other"];

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [paidInterest, setPaidInterest] = useState(false);

  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validateEmail(value: string): boolean {
    if (!value.trim()) {
      setEmailError("Email is required so we can reach you.");
      return false;
    }
    if (!EMAIL_RE.test(value.trim())) {
      setEmailError("That email doesn't look right. Check for typos.");
      return false;
    }
    setEmailError(undefined);
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    if (!validateEmail(email)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          gradeLevel: gradeLevel || undefined,
          targetYear: targetYear.trim() || undefined,
          paidInterest,
          referralSource: getClientId(),
        }),
      });

      if (res.ok) {
        trackEvent("waitlist_submitted", { paid_interest: paidInterest });
        if (paidInterest) trackEvent("paid_interest_clicked");
        setDone(true);
        return;
      }

      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      setFormError(
        payload.error ??
          "Something went wrong while saving your signup. Please try again in a moment.",
      );
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return <WaitlistSuccess email={email.trim().toLowerCase()} />;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-clay-xl border border-clay-line bg-clay p-7 shadow-clay-lg lg:p-8"
    >
      {formError ? (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-clay border border-state-weak bg-berry-tint px-4 py-3"
        >
          <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-state-weak" strokeWidth={2} />
          <p className="text-sm font-medium text-berry-deep">{formError}</p>
        </div>
      ) : null}

      <div className="grid gap-5">
        <ClayInput
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="juan.delacruz@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={(e) => validateEmail(e.target.value)}
          error={emailError}
          hint="We'll only email you about Tero updates."
          trailing={<Mail aria-hidden className="h-5 w-5" strokeWidth={1.75} />}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="grade" className="text-sm font-semibold text-ink">
            Year level <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <select
            id="grade"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="min-h-[48px] w-full rounded-2xl border border-clay-line bg-cream px-4 text-base text-ink focus:border-berry focus:outline-none focus-visible:outline-3 focus-visible:outline-berry focus-visible:outline-offset-2"
          >
            <option value="">Prefer not to say</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <ClayInput
          label="Target UPCAT year"
          type="text"
          placeholder="e.g. 2027"
          value={targetYear}
          onChange={(e) => setTargetYear(e.target.value)}
          hint="When are you planning to take UPCAT? (optional)"
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-clay border border-clay-line bg-cream px-4 py-3.5">
          <input
            type="checkbox"
            checked={paidInterest}
            onChange={(e) => {
              setPaidInterest(e.target.checked);
              if (e.target.checked) trackEvent("paid_interest_clicked", { source: "checkbox" });
            }}
            className="mt-1 h-5 w-5 shrink-0 rounded border border-clay-line accent-berry"
          />
          <span className="text-sm leading-relaxed text-ink">
            I&rsquo;d be interested in a future <span className="font-semibold">paid plan</span> with
            full practice sets and deeper reports.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="clay-press mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-mango px-6 text-base font-bold text-white shadow-clay-mango hover:bg-mango-deep disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 aria-hidden className="h-5 w-5 animate-spin" strokeWidth={2} />
            Joining…
          </>
        ) : (
          "Join the waitlist"
        )}
      </button>

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        By joining, you agree to receive occasional emails from Tero. We never sell your data. See
        our{" "}
        <a href="/privacy" className="font-semibold text-berry underline underline-offset-2">
          Privacy &amp; Disclaimer
        </a>
        .
      </p>
    </form>
  );
}
