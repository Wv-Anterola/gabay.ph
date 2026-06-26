import type { Metadata } from "next";
import { Check } from "lucide-react";
import WaitlistForm from "@/app/components/waitlist/WaitlistForm";
import TrackView from "@/app/components/shared/TrackView";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Join the Tero waitlist for new UPCAT practice sets and features. Tell us if you'd be interested in a future paid plan.",
};

const PERKS = [
  "Be first to get new UPCAT practice sets",
  "Early access to deeper weak-topic reports",
  "Help shape what Tero builds next",
];

export default function WaitlistPage() {
  return (
    <div className="mx-auto max-w-wide px-5 py-14 lg:px-8 lg:py-20">
      <TrackView event="waitlist_clicked" props={{ source: "waitlist_page" }} />
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-clay-line bg-clay px-4 py-1.5 text-xs font-semibold text-ink-muted">
            Waitlist
          </span>
          <h1 className="mt-4 font-display text-h1 font-bold text-ink">
            Want more UPCAT practice from Tero?
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
            The mock exam and 7-day plan are free today. Join the waitlist to hear first when we add
            more practice sets, deeper reports, and new features.
          </p>

          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-teal-tint text-teal-deep">
                  <Check aria-hidden className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-medium text-ink">{p}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Built for UPCAT first. More CETs coming later.
          </p>
        </div>

        <WaitlistForm />
      </div>
    </div>
  );
}
