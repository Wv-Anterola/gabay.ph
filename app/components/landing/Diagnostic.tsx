import { BadgeCheck, Equal, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "@/app/components/shared/Reveal";

type State = {
  label: string;
  meaning: string;
  Icon: LucideIcon;
  invert?: boolean;
};

const STATES: State[] = [
  {
    label: "Strong",
    meaning:
      "You've got this. Light touch-ups only, so you don't burn a week re-reading what you already know.",
    Icon: BadgeCheck,
  },
  {
    label: "Steady",
    meaning:
      "Solid but shaky. A few targeted sessions are enough to lock it in before exam day.",
    Icon: Equal,
  },
  {
    label: "Focus area",
    meaning: "The real gap. This is where your 7-day plan spends most of its energy.",
    Icon: Target,
    invert: true,
  },
];

export default function Diagnostic() {
  return (
    <section id="diagnostic" className="scroll-mt-24 bg-porcelain">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 lg:py-32">
        <div className="max-w-[52ch]">
          <Reveal>
            <h2 className="font-display text-[2rem] leading-[1.1] text-deep-maroon sm:text-[2.5rem]">
              A diagnosis you can&rsquo;t misread.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-rosewood">
              Every subject is labeled in plain words and marked with an icon, never by color
              alone. Whoever you are, however you see, the verdict is unmistakable.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {STATES.map((state, i) => {
            const { Icon } = state;
            return (
              <Reveal key={state.label} delay={i * 80}>
                <div
                  className={`flex h-full flex-col rounded-[20px] p-6 ${
                    state.invert
                      ? "bg-deep-maroon text-white"
                      : "bg-white ring-1 ring-rose-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-[12px] ${
                        state.invert
                          ? "bg-white/15 text-white"
                          : "bg-maroon-mist text-deep-maroon"
                      }`}
                      aria-hidden="true"
                    >
                      <Icon size={20} strokeWidth={2.25} />
                    </span>
                    <h3
                      className={`text-[1.15rem] font-medium ${
                        state.invert ? "text-white" : "text-deep-maroon"
                      }`}
                    >
                      {state.label}
                    </h3>
                  </div>
                  <p
                    className={`mt-4 text-[0.95rem] leading-relaxed ${
                      state.invert ? "text-white/80" : "text-rosewood"
                    }`}
                  >
                    {state.meaning}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
