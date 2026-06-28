"use client";

import Link from "next/link";
import { Target, ArrowRight, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target aria-hidden className="size-5 text-berry" strokeWidth={2} />
            Your biggest opportunities
          </CardTitle>
          <CardDescription>
            Improving these topics is likely to lift your readiness the most.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {top3.length === 0 ? (
            <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              No clear weak spots in what you took. Retake the mock later to sharpen your picture.
            </p>
          ) : (
            <ol className="space-y-3">
              {top3.map((t, i) => (
                <li
                  key={t.module + t.topic}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/50 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-berry text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">
                        {MODULES[t.module].shortName} · {t.topic}
                      </p>
                      <Link
                        href={`/practice/${t.module}`}
                        onClick={() =>
                          trackEvent("weak_topic_viewed", { module: t.module, topic: t.topic })
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-berry hover:text-berry-deep"
                      >
                        Practice this topic
                        <ArrowRight aria-hidden className="size-3.5" strokeWidth={2} />
                      </Link>
                    </div>
                  </div>
                  <Badge variant="berry" className="tabular">
                    {t.accuracy}%
                  </Badge>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles aria-hidden className="size-5 text-teal" strokeWidth={2} />
            Your strengths
          </CardTitle>
          <CardDescription>
            Areas you already handle well. Keep them warm with light review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {strengths.length === 0 ? (
            <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              No topics hit the Strong mark yet, and that is completely okay. Your study plan will
              help you get there.
            </p>
          ) : (
            <ul className="space-y-3">
              {strengths.slice(0, 4).map((t) => (
                <li
                  key={t.module + t.topic}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/50 px-4 py-3"
                >
                  <p className="truncate text-sm font-bold text-foreground">
                    {MODULES[t.module].shortName} · {t.topic}
                  </p>
                  <Badge variant="teal" className="tabular">
                    {t.accuracy}%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
