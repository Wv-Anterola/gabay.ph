"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MODULE_ICON, MODULE_ACCENT } from "@/app/components/shared/moduleVisuals";
import { trackEvent } from "@/lib/analytics";
import {
  DEFAULT_STUDY_MINUTES,
  STUDY_TIME_OPTIONS,
  generateStudyPlan,
  type StudyMinutes,
} from "@/lib/studyPlan";
import { loadStudyMinutes, saveStudyMinutes } from "@/lib/storage";
import type { DiagnosticResult } from "@/lib/types";

const TIME_LABEL: Record<StudyMinutes, string> = {
  30: "30 min",
  60: "1 hr",
  120: "2 hrs",
};

export default function StudyPlan7Day({ result }: { result: DiagnosticResult }) {
  const [minutes, setMinutes] = useState<StudyMinutes>(DEFAULT_STUDY_MINUTES);

  // Read the saved preference after mount so SSR and first client render match.
  useEffect(() => {
    const saved = loadStudyMinutes();
    if (saved !== null) setMinutes(saved);
  }, []);

  const plan = useMemo(() => generateStudyPlan(result, minutes), [result, minutes]);

  function selectMinutes(next: StudyMinutes) {
    setMinutes(next);
    saveStudyMinutes(next);
    trackEvent("study_time_set", { minutes: next });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays aria-hidden className="size-5 text-berry" strokeWidth={2} />
              Your 7-day study plan
            </CardTitle>
            <CardDescription>
              What to review each day, organized into broad study areas and question types.
            </CardDescription>
          </div>
          <div className="shrink-0">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Review time per day
            </p>
            <div
              role="radiogroup"
              aria-label="Review time per day"
              className="inline-flex items-center gap-1 rounded-lg bg-muted p-1"
            >
              {STUDY_TIME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={minutes === option}
                  onClick={() => selectMinutes(option)}
                  className={`tabular rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                    minutes === option
                      ? "bg-berry text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {TIME_LABEL[option]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ol>
          {plan.map((d, i) => (
            <Fragment key={d.day}>
              {i > 0 ? <Separator /> : null}
              <li className="flex gap-3 py-4">
                <span className="tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-berry text-sm font-bold text-white">
                  {d.day}
                </span>
                <div className="flex-1 space-y-3">
                  {d.topics.map((t) => {
                    const Icon = MODULE_ICON[t.module];
                    return (
                      <div
                        key={`${t.module}-${t.id}`}
                        className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 sm:flex-nowrap"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${MODULE_ACCENT[t.module]}`}
                        >
                          <Icon aria-hidden className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground">{t.focus}</p>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {t.moduleName} · Question types: {t.questionTypes.join(" · ")}
                          </p>
                        </div>
                        <div className="tabular ml-10 flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground sm:ml-0 sm:text-sm">
                          <span>{t.accuracy}% in mock</span>
                          <span className="inline-flex items-center gap-1.5 text-berry">
                            <Clock aria-hidden className="size-4" strokeWidth={2} />
                            {t.minutes} min
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </li>
            </Fragment>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
