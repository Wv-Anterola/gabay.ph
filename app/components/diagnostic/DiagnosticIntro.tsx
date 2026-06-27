import { Clock, ListChecks, ShieldCheck, Save } from "lucide-react";
import { MODULES, MODULE_ORDER } from "@/lib/questions";

const TOTAL_ITEMS = MODULE_ORDER.reduce((s, id) => s + MODULES[id].itemCount, 0);
const TOTAL_MIN = MODULE_ORDER.reduce((s, id) => s + MODULES[id].estimatedMinutes, 0);

const FACTS = [
  { icon: ListChecks, label: `${TOTAL_ITEMS} original items`, sub: "Across 4 UPCAT modules" },
  { icon: Clock, label: `~${TOTAL_MIN} minutes total`, sub: "One full mock exam" },
  { icon: Save, label: "Progress saved", sub: "Pick up where you left off" },
  { icon: ShieldCheck, label: "No login to start", sub: "Free, no payment needed" },
];

export default function DiagnosticIntro() {
  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-clay-line bg-clay px-4 py-1.5 text-xs font-semibold text-ink-muted">
        Free UPCAT mock exam
      </span>
      <h1 className="mt-4 font-display text-h1 font-bold text-ink">
        Let&rsquo;s find out what to study first.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
        Start one timed mock exam with original practice questions. When you finish, Tero shows your
        score, missed-answer review, weak topics, and 7-day study plan.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FACTS.map((f) => (
          <div
            key={f.label}
            className="rounded-clay border border-clay-line bg-cream px-5 py-4 shadow-clay-sm"
          >
            <f.icon aria-hidden className="h-6 w-6 text-teal" strokeWidth={1.75} />
            <dt className="mt-3 text-sm font-bold text-ink">{f.label}</dt>
            <dd className="text-xs text-ink-muted">{f.sub}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
