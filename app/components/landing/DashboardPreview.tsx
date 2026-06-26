import { Check, TrendingUp, AlertCircle } from "lucide-react";
import ProgressRing from "@/app/components/ui/ProgressRing";

/**
 * Layered claymorphism "readiness dashboard" preview shown in the hero.
 * Purely illustrative sample data (decorative, aria-hidden where appropriate).
 */
export default function DashboardPreview() {
  const modules = [
    { name: "Language", value: 82, tone: "strong" as const },
    { name: "Reading", value: 71, tone: "steady" as const },
    { name: "Math", value: 48, tone: "weak" as const },
    { name: "Science", value: 64, tone: "steady" as const },
  ];

  return (
    <div className="relative">
      {/* Floating accent card behind */}
      <div className="absolute -right-4 -top-6 hidden rotate-3 rounded-clay border-2 border-clay-line bg-mango-tint px-4 py-3 md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-mango-deep">7-day plan</p>
        <p className="text-sm font-bold text-ink">Ready in minutes</p>
      </div>

      <div className="rounded-clay-lg border-2 border-clay-line bg-cream p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Your readiness signal
            </p>
            <p className="font-display text-2xl font-bold text-ink">Mock complete</p>
          </div>
          <ProgressRing value={66} tone="berry" size={72} stroke={9} label="Overall readiness" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {modules.map((m) => (
            <div
              key={m.name}
              className="rounded-clay border-2 border-clay-line bg-clay px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{m.name}</span>
                <span className="tabular text-sm font-bold text-ink">{m.value}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-clay-deep">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${m.value}%`,
                    backgroundColor:
                      m.tone === "strong"
                        ? "#3E8E63"
                        : m.tone === "steady"
                          ? "#C98A2B"
                          : "#B23A48",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-clay border-2 border-berry-soft/30 bg-berry-tint px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertCircle aria-hidden className="h-4 w-4 text-berry" strokeWidth={2} />
            <p className="text-sm font-semibold text-berry-deep">Prioritize first: Math · Algebra</p>
          </div>
          <ul className="mt-2 space-y-1.5">
            <li className="flex items-center gap-2 text-xs text-ink-muted">
              <Check aria-hidden className="h-3.5 w-3.5 text-state-strong" strokeWidth={2.5} />
              Day 1: Linear equations — redo missed items
            </li>
            <li className="flex items-center gap-2 text-xs text-ink-muted">
              <TrendingUp aria-hidden className="h-3.5 w-3.5 text-teal" strokeWidth={2.5} />
              Day 2: Word problems — timed practice set
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
