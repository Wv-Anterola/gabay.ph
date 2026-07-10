"use client";

import Link from "next/link";
import { Sparkles, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function ResultActions() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-5 p-7 text-center lg:p-9">
        <div>
          <h2 className="text-xl font-bold text-foreground">Ready to close your gaps?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Work through your study plan with your own reviewer, then retake the mock to see
            your progress. Want practice sets built into Tero? Tell us and we&rsquo;ll keep you
            posted.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link
              href="/waitlist"
              onClick={() => trackEvent("cta_click", { location: "results", cta: "more_practice" })}
            >
              <Sparkles strokeWidth={2} />
              I want practice sets
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/diagnostic">
              <RotateCcw strokeWidth={2} />
              Take another mock
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
