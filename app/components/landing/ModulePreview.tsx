import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MODULES, MODULE_ORDER } from "@/lib/questions";
import { MODULE_ICON, MODULE_ACCENT } from "@/app/components/shared/moduleVisuals";
import Tag from "@/app/components/ui/Tag";

const SAMPLE_TOPICS: Record<string, string[]> = {
  language: ["Grammar", "Vocabulary", "Analogies"],
  reading: ["Main Idea", "Inference", "Author's Purpose"],
  math: ["Algebra", "Geometry", "Word Problems"],
  science: ["Biology", "Chemistry", "Physics"],
};

export default function ModulePreview() {
  return (
    <section id="modules" className="mx-auto max-w-wide scroll-mt-24 px-5 py-16 lg:px-8 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-mango-deep">
            UPCAT module preview
          </p>
          <h2 className="mt-2 font-display text-h1 font-bold text-ink">
            Four modules, one focused diagnostic.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Gabay covers the four UPCAT subtests as short mini-tests you can take one at a time.
          </p>
        </div>
        <Link
          href="/diagnostic"
          className="inline-flex items-center gap-2 text-sm font-semibold text-berry hover:text-berry-deep"
        >
          Start with any module
          <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {MODULE_ORDER.map((id) => {
          const m = MODULES[id];
          const Icon = MODULE_ICON[id];
          return (
            <Link
              key={id}
              href={`/diagnostic/${id}`}
              className="clay-press group rounded-clay-lg border-2 border-clay-line bg-cream p-6 shadow-clay hover:shadow-clay-lg"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-clay-sm ${MODULE_ACCENT[id]}`}
              >
                <Icon aria-hidden className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{m.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.blurb}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {SAMPLE_TOPICS[id].map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>

              <p className="tabular mt-5 text-xs font-semibold text-ink-faint">
                {m.itemCount} items · ~{m.estimatedMinutes} min
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
