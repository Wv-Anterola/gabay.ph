import { PartyPopper, ArrowRight } from "lucide-react";
import ClayButton from "@/app/components/ui/ClayButton";

export default function WaitlistSuccess({ email }: { email: string }) {
  return (
    <div className="rounded-clay-xl border-2 border-clay-line bg-clay p-8 text-center shadow-clay-lg">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-clay bg-teal text-white shadow-clay">
        <PartyPopper aria-hidden className="h-8 w-8" strokeWidth={1.75} />
      </span>
      <h2 className="mt-5 font-display text-h2 font-bold text-ink">You&rsquo;re on the list!</h2>
      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-muted">
        Thanks for joining. We&rsquo;ll email{" "}
        <span className="font-semibold text-ink">{email}</span> when new UPCAT practice sets and
        features are ready. No spam, just useful updates.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
        <ClayButton href="/diagnostic" variant="primary">
          Take the free diagnostic
          <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
        </ClayButton>
        <ClayButton href="/" variant="secondary">
          Back to home
        </ClayButton>
      </div>
    </div>
  );
}
