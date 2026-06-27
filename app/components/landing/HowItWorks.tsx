import { PenLine, BarChart3, CalendarCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "@/app/components/shared/Reveal";

type Step = {
  n: string;
  title: string;
  body: string;
  Icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    n: "1",
    title: "Sit one 50-minute mock",
    body: "A single timed sitting that mirrors the real test across all four areas. No account, no payment, start in seconds.",
    Icon: PenLine,
  },
  {
    n: "2",
    title: "Get an honest readiness signal",
    body: "The moment you finish, your answers become an overall score and a per-subject breakdown that flags where you're strong, steady, or genuinely behind.",
    Icon: BarChart3,
  },
  {
    n: "3",
    title: "Follow a focused 7-day plan",
    body: "Your weak spots turn into a prioritized week, pointing you at the exact topics and daily actions that move your score the most.",
    Icon: CalendarCheck,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-content scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32"
    >
      <Reveal>
        <h2 className="max-w-[16ch] font-display text-[2rem] leading-[1.1] text-deep-maroon sm:text-[2.5rem]">
          Under an hour from anxious to certain.
        </h2>
      </Reveal>

      <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-3">
        {STEPS.map((step, i) => {
          const { Icon } = step;
          return (
            <Reveal as="li" key={step.n} delay={i * 80}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-[14px] bg-deep-maroon text-white">
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                <span className="font-display text-[1.75rem] leading-none text-dusty-rose">
                  {step.n}
                </span>
              </div>
              <h3 className="mt-5 text-[1.2rem] font-medium text-deep-maroon">{step.title}</h3>
              <p className="mt-2.5 max-w-[34ch] text-[0.98rem] leading-relaxed text-rosewood">
                {step.body}
              </p>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
