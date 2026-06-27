import { Plus } from "lucide-react";
import Reveal from "@/app/components/shared/Reveal";

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: "Do I need to pay or sign up?",
    a: "No. The mock and your full 7-day plan are free, with no account, no email wall, and no payment to start.",
  },
  {
    q: "How long does the mock take?",
    a: "About 50 minutes in a single sitting. It covers all four areas in roughly the proportions you'll see on the real test.",
  },
  {
    q: "Is this the official UPCAT?",
    a: "No. Tero is independent practice built to mirror the structure and feel of the exam. It is not affiliated with or endorsed by the University of the Philippines.",
  },
  {
    q: "How accurate is the readiness signal?",
    a: "It reflects how you performed on a test designed to mirror the real areas. Treat it as an honest guide to where your time is best spent, not a predicted final score.",
  },
  {
    q: "What exactly do I get at the end?",
    a: "An overall readiness signal, a per-subject breakdown labeled in plain words and icons, and a prioritized 7-day plan with concrete daily actions.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 bg-porcelain">
      <div className="mx-auto max-w-[760px] px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <h2 className="font-display text-[2rem] leading-[1.1] text-deep-maroon sm:text-[2.5rem]">
            Questions, answered plainly.
          </h2>
        </Reveal>

        <div className="mt-10 divide-y divide-rose-border border-t border-rose-border">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[1.05rem] font-medium text-deep-maroon [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white ring-1 ring-rose-border transition-transform duration-300 ease-out group-open:rotate-45">
                    <Plus size={15} strokeWidth={2.25} className="text-deep-maroon" />
                  </span>
                </summary>
                <p className="max-w-[62ch] pb-6 text-[0.98rem] leading-relaxed text-rosewood">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
