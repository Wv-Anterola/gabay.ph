import ReadinessPill from "@/app/components/shared/ReadinessPill";
import type { ModuleScore } from "@/lib/types";

const BAR_COLOR: Record<string, string> = {
  strong: "#3E8E63",
  steady: "#C98A2B",
  needs_work: "#B23A48",
};

/**
 * Accessible horizontal bar chart of module accuracy. Each bar carries a
 * numeric label and a readiness pill, so meaning never depends on color alone.
 * A visually-hidden table mirrors the data for screen readers.
 */
export default function ReadinessChart({ modules }: { modules: ModuleScore[] }) {
  return (
    <section className="rounded-clay-lg border-2 border-clay-line bg-cream p-7 shadow-clay">
      <h2 className="text-lg font-bold text-ink">Topic & module breakdown</h2>
      <p className="mt-1 text-sm text-ink-muted">
        How you did across each UPCAT module. Longer bars mean higher accuracy.
      </p>

      <ul className="mt-6 space-y-5">
        {modules.map((m) => (
          <li key={m.module}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">{m.name}</span>
              <div className="flex items-center gap-2">
                <span className="tabular text-sm font-bold text-ink">{m.accuracy}%</span>
                <ReadinessPill level={m.level} />
              </div>
            </div>
            <div
              className="mt-2 h-3 w-full overflow-hidden rounded-full bg-clay-deep"
              role="img"
              aria-label={`${m.name}: ${m.accuracy} percent, ${m.level.replace("_", " ")}`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${m.accuracy}%`, backgroundColor: BAR_COLOR[m.level] }}
              />
            </div>

            {/* Per-topic mini rows */}
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {m.topics.map((t) => (
                <li
                  key={t.topic}
                  className="flex items-center justify-between rounded-lg border border-clay-line bg-clay px-3 py-1.5"
                >
                  <span className="truncate text-xs text-ink-muted">{t.topic}</span>
                  <span className="tabular text-xs font-semibold text-ink">{t.accuracy}%</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
