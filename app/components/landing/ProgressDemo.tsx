import { Check, Minus, AlertCircle } from "lucide-react";
import ProgressRing from "@/app/components/ui/ProgressRing";

const ROWS = [
  { label: "Language Proficiency", value: 82, level: "Strong" as const },
  { label: "Reading Comprehension", value: 71, level: "Steady" as const },
  { label: "Science", value: 64, level: "Steady" as const },
  { label: "Mathematics", value: 48, level: "Needs work" as const },
];

const LEVEL_META = {
  Strong: { icon: Check, tone: "text-state-strong", tint: "bg-teal-tint", ring: "strong" as const },
  Steady: { icon: Minus, tone: "text-state-steady", tint: "bg-mango-tint", ring: "steady" as const },
  "Needs work": { icon: AlertCircle, tone: "text-state-weak", tint: "bg-berry-tint", ring: "weak" as const },
};

export default function ProgressDemo() {
  return (
    <section className="bg-clay/50 py-16 lg:py-24">
      <div className="mx-auto grid max-w-wide items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-mango-deep">
            Weak-topic readiness dashboard
          </p>
          <h2 className="mt-2 font-display text-h1 font-bold text-ink">
            A readiness signal you can actually act on.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Every module gets an honest label: Strong, Steady, or Needs work. The label always comes
            with an icon and words, never color alone, so the meaning is unmistakable.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-faint">
            This is a study guide based on your answers. It is not an admissions prediction.
          </p>
        </div>

        <div className="rounded-clay-xl border-2 border-clay-line bg-cream p-7">
          <div className="flex items-center justify-between border-b-2 border-clay-line pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Overall readiness
              </p>
              <p className="font-display text-2xl font-bold text-ink">Steady — keep building</p>
            </div>
            <ProgressRing value={66} tone="berry" size={80} stroke={10} label="Overall readiness" />
          </div>

          <ul className="mt-5 space-y-3">
            {ROWS.map((r) => {
              const meta = LEVEL_META[r.level];
              return (
                <li
                  key={r.label}
                  className="flex items-center gap-4 rounded-clay border-2 border-clay-line bg-clay px-4 py-3"
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.tint}`}>
                    <meta.icon aria-hidden className={`h-5 w-5 ${meta.tone}`} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{r.label}</p>
                    <p className={`text-xs font-medium ${meta.tone}`}>{r.level}</p>
                  </div>
                  <span className="tabular text-sm font-bold text-ink">{r.value}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
