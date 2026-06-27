import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/app/components/shared/Reveal";

type Day = {
  day: string;
  subject: string;
  topic: string;
  action: string;
};

const PLAN: Day[] = [
  {
    day: "Day 1",
    subject: "Mathematics",
    topic: "Algebra foundations",
    action: "Relearn linear and quadratic equations, then 20 practice items.",
  },
  {
    day: "Day 2",
    subject: "Mathematics",
    topic: "Word problems",
    action: "Turn 15 word problems into equations before solving.",
  },
  {
    day: "Day 3",
    subject: "Science",
    topic: "Scientific reasoning",
    action: "Timed set of 20 experiment-and-inference questions.",
  },
  {
    day: "Day 4",
    subject: "Mathematics",
    topic: "Geometry and measurement",
    action: "Angles, area, and volume across 20 mixed items.",
  },
  {
    day: "Day 5",
    subject: "Language",
    topic: "Grammar and usage",
    action: "Drill subject-verb agreement and modifiers, 25 items.",
  },
  {
    day: "Day 6",
    subject: "Mathematics",
    topic: "Mixed timed set",
    action: "One full 30-item math section, strictly under time.",
  },
  {
    day: "Day 7",
    subject: "Review",
    topic: "Retake and compare",
    action: "Redo the mock and watch the focus area move.",
  },
];

export default function StudyPlan() {
  return (
    <section className="mx-auto max-w-content px-5 py-24 sm:px-8 lg:py-32">
      <div className="rounded-[24px] bg-porcelain p-6 sm:p-10 lg:p-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <div className="max-w-[40ch]">
              <h2 className="font-display text-[2rem] leading-[1.1] text-deep-maroon sm:text-[2.5rem]">
                Not &ldquo;review everything.&rdquo; This, in this order.
              </h2>
              <p className="mt-5 text-[1.05rem] leading-relaxed text-rosewood">
                Tero turns your weak spots into concrete daily actions, weighted toward the topics
                that close the biggest gap first.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-[0.85rem] font-medium text-rosewood">Sample plan, Math-weighted</p>
          </Reveal>
        </div>

        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN.map((d, i) => (
            <Reveal as="li" key={d.day} delay={i * 50}>
              <div className="flex h-full flex-col rounded-[16px] bg-white p-5 ring-1 ring-rose-border">
                <div className="flex items-center justify-between">
                  <span className="text-[0.8rem] font-medium text-deep-maroon">{d.day}</span>
                  <span className="rounded-full bg-maroon-mist px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-deep-maroon">
                    {d.subject}
                  </span>
                </div>
                <h3 className="mt-4 text-[1.02rem] font-medium leading-snug text-deep-maroon">
                  {d.topic}
                </h3>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-rosewood">{d.action}</p>
              </div>
            </Reveal>
          ))}

          <Reveal as="li" delay={PLAN.length * 50}>
            <Link
              href="/diagnostic"
              className="group flex h-full flex-col justify-between rounded-[16px] bg-deep-maroon p-5 text-white transition-transform duration-200 active:scale-[0.98]"
            >
              <p className="text-[1.02rem] font-medium leading-snug">Get your own plan, free.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[0.88rem] text-white/85">
                Start the mock
                <ArrowRight
                  size={16}
                  strokeWidth={2.25}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </Reveal>
        </ol>
      </div>
    </section>
  );
}
