import { Gift, Zap, LockOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "@/app/components/shared/Reveal";

type Point = { title: string; body: string; Icon: LucideIcon };

const POINTS: Point[] = [
  {
    title: "Free, the whole way",
    body: "No payment to take the mock or to read your full 7-day plan.",
    Icon: Gift,
  },
  {
    title: "Instant results",
    body: "Your readiness signal and plan appear the second you finish.",
    Icon: Zap,
  },
  {
    title: "No account needed",
    body: "No sign-up, no email wall. Start now and decide for yourself.",
    Icon: LockOpen,
  },
];

export default function WhyTero() {
  return (
    <section className="mx-auto max-w-content px-5 py-24 sm:px-8 lg:py-28">
      <div className="grid divide-y divide-rose-border border-y border-rose-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {POINTS.map((point, i) => {
          const { Icon } = point;
          return (
            <Reveal key={point.title} delay={i * 80}>
              <div className="py-8 sm:px-8 sm:py-10">
                <Icon size={24} strokeWidth={2.25} className="text-deep-maroon" />
                <h3 className="mt-4 text-[1.1rem] font-medium text-deep-maroon">{point.title}</h3>
                <p className="mt-2 max-w-[32ch] text-[0.95rem] leading-relaxed text-rosewood">
                  {point.body}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
