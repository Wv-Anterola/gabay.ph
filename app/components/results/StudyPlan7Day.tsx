"use client";

import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { MODULE_ICON, MODULE_ACCENT } from "@/app/components/shared/moduleVisuals";
import { trackEvent } from "@/lib/analytics";
import type { StudyDay } from "@/lib/types";

export default function StudyPlan7Day({ plan }: { plan: StudyDay[] }) {
  return (
    <section className="rounded-clay-lg border-2 border-clay-line bg-clay p-7 shadow-clay">
      <div className="flex items-center gap-2">
        <CalendarDays aria-hidden className="h-5 w-5 text-berry" strokeWidth={2} />
        <h2 className="text-lg font-bold text-ink">Your 7-day UPCAT study plan</h2>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        A simple, day-by-day guide built from your weakest topics. Start today.
      </p>

      <ol className="mt-6 grid gap-3">
        {plan.map((d) => {
          const Icon = MODULE_ICON[d.module];
          return (
            <li
              key={d.day}
              className="flex flex-col gap-3 rounded-clay border-2 border-clay-line bg-cream px-5 py-4 shadow-clay-sm sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
                <span className="tabular flex h-10 w-10 items-center justify-center rounded-2xl bg-berry font-display text-base font-bold text-white shadow-clay-berry">
                  {d.day}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${MODULE_ACCENT[d.module]}`}
                >
                  <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-bold text-ink">{d.topic}</span>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-ink-muted">{d.focus}</p>
              <Link
                href={d.practiceHref}
                onClick={() => trackEvent("practice_started", { module: d.module, from: "study_plan" })}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-berry hover:text-berry-deep"
              >
                Practice
                <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
