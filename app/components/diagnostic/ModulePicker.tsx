"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { MODULES, MODULE_ORDER } from "@/lib/questions";
import { MODULE_ICON, MODULE_ACCENT } from "@/app/components/shared/moduleVisuals";
import { getCompletedModules } from "@/lib/storage";
import type { ModuleId } from "@/lib/types";

/** Four UPCAT module cards. Marks completed modules from localStorage. */
export default function ModulePicker() {
  const [completed, setCompleted] = useState<ModuleId[]>([]);

  useEffect(() => {
    setCompleted(getCompletedModules());
  }, []);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {MODULE_ORDER.map((id) => {
        const m = MODULES[id];
        const Icon = MODULE_ICON[id];
        const done = completed.includes(id);
        return (
          <Link
            key={id}
            href={`/diagnostic/${id}`}
            className="clay-press group flex items-start gap-4 rounded-clay-lg border border-clay-line bg-cream p-6 shadow-clay hover:shadow-clay-lg"
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-clay-sm ${MODULE_ACCENT[id]}`}
            >
              <Icon aria-hidden className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-ink">{m.name}</h3>
                {done ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-state-strong">
                    <CheckCircle2 aria-hidden className="h-4 w-4" strokeWidth={2} />
                    Done
                  </span>
                ) : (
                  <Circle aria-hidden className="h-4 w-4 text-ink-faint" strokeWidth={2} />
                )}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{m.blurb}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="tabular text-xs font-semibold text-ink-faint">
                  {m.itemCount} items · ~{m.estimatedMinutes} min
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-berry group-hover:text-berry-deep">
                  {done ? "Retake" : "Start"}
                  <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
