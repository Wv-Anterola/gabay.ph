import { ClipboardCheck, BarChart3, CalendarDays } from "lucide-react";

const STEPS = [
  {
    n: 1,
    icon: ClipboardCheck,
    title: "Take a free mock exam",
    body: "Answer one full mock across the four UPCAT modules. No login needed to start, and your progress is saved as you go.",
  },
  {
    n: 2,
    icon: BarChart3,
    title: "Review your results",
    body: "Get a readiness score, section breakdown, and explanations for the questions you missed.",
  },
  {
    n: 3,
    icon: CalendarDays,
    title: "Follow a 7-day study plan",
    body: "Tero turns your weak topics into a simple day-by-day plan you can actually start tonight, with practice built in.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-clay/50 py-16 lg:py-24">
      <div className="mx-auto max-w-wide px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-mango-deep">How it works</p>
          <h2 className="mt-2 font-display text-h1 font-bold text-ink">
            From mock exam to review in three steps.
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="relative rounded-clay-lg border-2 border-clay-line bg-cream p-7 shadow-clay"
            >
              <div className="flex items-center gap-3">
                <span className="tabular flex h-11 w-11 items-center justify-center rounded-2xl bg-berry font-display text-lg font-bold text-white shadow-clay-berry">
                  {s.n}
                </span>
                <s.icon aria-hidden className="h-7 w-7 text-teal" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
