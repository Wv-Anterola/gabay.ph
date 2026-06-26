"use client";

import Link from "next/link";
import { Target, ArrowRight, Sparkles } from "lucide-react";
import { MODULES } from "@/lib/questions";
import { trackEvent } from "@/lib/analytics";
import type { TopicScore } from "@/lib/types";

export default function WeakTopicList({
  weakTopics,
  strengths,
}: {
  weakTopics: TopicScore[];
  strengths: TopicScore[];
}) {
  const top3 = weakTopics.slice(0, 3);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {/* Weak areas */}
      <div className="rounded-clay-lg border-2 border-clay-line bg-cream p-7 shadow-clay">
        <div className="flex items-center gap-2">
          <Target aria-hidden className="h-5 w-5 text-berry" strokeWidth={2} />
          <h2 className="text-lg font-bold text-ink">Top weak areas</h2>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Your mock exam suggests you should prioritize these UPCAT topics first.
        </p>

        {top3.length === 0 ? (
          <p className="mt-5 rounded-clay border-2 border-clay-line bg-clay px-4 py-3 text-sm text-ink-muted">
            No clear weak spots in what you took. Retake the mock later to sharpen your picture.
          </p>
        ) : (
          <ol className="mt-5 space-y-3">
            {top3.map((t, i) => (
              <li
                key={t.module + t.topic}
                className="rounded-clay border-2 border-berry-soft/25 bg-berry-tint px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="tabular flex h-6 w-6 items-center justify-center rounded-lg bg-berry text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="text-sm font-bold text-berry-deep">
                      {MODULES[t.module].shortName} · {t.topic}
                    </p>
                  </div>
                  <span className="tabular rounded-full bg-cream px-2.5 py-0.5 text-xs font-bold text-berry-deep">
                    {t.accuracy}%
                  </span>
                </div>
                <Link
                  href={`/practice/${t.module}`}
                  onClick={() =>
                    trackEvent("weak_topic_viewed", { module: t.module, topic: t.topic })
                  }
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-berry hover:text-berry-deep"
                >
                  Practice this topic
                  <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Strengths */}
      <div className="rounded-clay-lg border-2 border-clay-line bg-cream p-7 shadow-clay">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden className="h-5 w-5 text-teal" strokeWidth={2} />
          <h2 className="text-lg font-bold text-ink">Your strengths</h2>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Areas you already handle well. Keep them warm with light review.
        </p>

        {strengths.length === 0 ? (
          <p className="mt-5 rounded-clay border-2 border-clay-line bg-clay px-4 py-3 text-sm text-ink-muted">
            No topics hit the Strong mark yet, and that is completely okay. Your study plan will help
            you get there.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {strengths.slice(0, 4).map((t) => (
              <li
                key={t.module + t.topic}
                className="flex items-center justify-between rounded-clay border-2 border-teal-soft/25 bg-teal-tint px-4 py-3"
              >
                <p className="text-sm font-bold text-teal-deep">
                  {MODULES[t.module].shortName} · {t.topic}
                </p>
                <span className="tabular rounded-full bg-cream px-2.5 py-0.5 text-xs font-bold text-teal-deep">
                  {t.accuracy}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
