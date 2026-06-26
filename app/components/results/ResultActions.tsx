"use client";

import Link from "next/link";
import { Target, Sparkles, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { ModuleId } from "@/lib/types";

export default function ResultActions({ weakestModule }: { weakestModule: ModuleId }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-5 p-7 text-center lg:p-9">
        <div>
          <h2 className="text-xl font-bold text-foreground">Ready to close your gaps?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Practice your weakest topics now, or tell us you want more practice sets and we&rsquo;ll
            keep you posted.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link
              href={`/practice/${weakestModule}`}
              onClick={() =>
                trackEvent("practice_started", { module: weakestModule, from: "results_actions" })
              }
            >
              <Target strokeWidth={2} />
              Practice my weak areas
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link
              href="/waitlist"
              onClick={() => trackEvent("cta_click", { location: "results", cta: "more_practice" })}
            >
              <Sparkles strokeWidth={2} />
              I want more practice
            </Link>
          </Button>
        </div>
        <Button asChild variant="ghost">
          <Link href="/diagnostic">
            <RotateCcw strokeWidth={2} />
            Take another mock
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
