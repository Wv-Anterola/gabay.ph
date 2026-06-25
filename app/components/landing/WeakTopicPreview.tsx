import { Target, ArrowRight } from "lucide-react";
import Link from "next/link";

const WEAK = [
  { module: "Mathematics", topic: "Algebra", accuracy: 33, note: "Linear equations and systems" },
  { module: "Mathematics", topic: "Word Problems", accuracy: 50, note: "Rate and ratio setups" },
  { module: "Science", topic: "Chemistry", accuracy: 50, note: "Acids, bases, and reactions" },
];

const PLAN = [
  { day: 1, text: "Algebra basics — review one worked example, then practice slowly" },
  { day: 2, text: "Word problems — set up rate and ratio equations" },
  { day: 3, text: "Chemistry — acids vs bases, then a short practice set" },
];

export default function WeakTopicPreview() {
  return (
    <section className="mx-auto max-w-wide px-5 py-16 lg:px-8 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-mango-deep">
          Weak-topic report
        </p>
        <h2 className="mt-2 font-display text-h1 font-bold text-ink">
          Your weakest topics, surfaced first.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Gabay does not just give a score. It tells you which topics to start with and turns them
          into a plan you can begin tonight.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Weak topics card */}
        <div className="rounded-clay-lg border-2 border-clay-line bg-cream p-7 shadow-clay">
          <div className="flex items-center gap-2">
            <Target aria-hidden className="h-5 w-5 text-berry" strokeWidth={2} />
            <h3 className="text-lg font-bold text-ink">Prioritize these UPCAT topics first</h3>
          </div>
          <ul className="mt-5 space-y-3">
            {WEAK.map((w) => (
              <li
                key={w.module + w.topic}
                className="rounded-clay border-2 border-berry-soft/25 bg-berry-tint px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-berry-deep">
                    {w.module} · {w.topic}
                  </p>
                  <span className="tabular rounded-full bg-cream px-2.5 py-0.5 text-xs font-bold text-berry-deep">
                    {w.accuracy}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">{w.note}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* 7-day plan card */}
        <div className="rounded-clay-lg border-2 border-clay-line bg-clay p-7 shadow-clay">
          <h3 className="text-lg font-bold text-ink">Your 7-day study plan (preview)</h3>
          <ol className="mt-5 space-y-3">
            {PLAN.map((p) => (
              <li key={p.day} className="flex gap-3">
                <span className="tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal font-bold text-white shadow-clay-sm">
                  {p.day}
                </span>
                <p className="text-sm leading-relaxed text-ink">{p.text}</p>
              </li>
            ))}
            <li className="flex items-center gap-2 pl-11 text-xs font-medium text-ink-faint">
              + four more days tailored to your results
            </li>
          </ol>
          <Link
            href="/diagnostic"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-berry hover:text-berry-deep"
          >
            Get your own plan
            <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
