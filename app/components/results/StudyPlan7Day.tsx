"use client";

import { Fragment } from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
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
import type { StudyDay } from "@/lib/types";

export default function StudyPlan7Day({ plan }: { plan: StudyDay[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays aria-hidden className="size-5 text-berry" strokeWidth={2} />
          Your 7-day study plan
        </CardTitle>
        <CardDescription>
          A day-by-day guide built from the topics that will move your score the most. Start today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol>
          {plan.map((d, i) => {
            const Icon = MODULE_ICON[d.module];
            return (
              <Fragment key={d.day}>
                {i > 0 ? <Separator /> : null}
                <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 sm:w-48 sm:shrink-0">
                    <span className="tabular flex h-9 w-9 items-center justify-center rounded-lg bg-berry text-sm font-bold text-white">
                      {d.day}
                    </span>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${MODULE_ACCENT[d.module]}`}
                    >
                      <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="text-sm font-bold text-foreground">{d.topic}</span>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{d.focus}</p>
                  <Link
                    href={d.practiceHref}
                    onClick={() =>
                      trackEvent("practice_started", { module: d.module, from: "study_plan" })
                    }
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-berry hover:text-berry-deep"
                  >
                    Practice
                    <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
                  </Link>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
