import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/app/components/shared/Reveal";
import ReadinessReport from "./ReadinessReport";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Decorative warmth — soft maroon-mist wash, never an affordance. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(243,230,232,0.9) 0%, rgba(243,230,232,0) 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-content items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28 lg:pt-24">
        <div className="max-w-xl">
          <Reveal>
            <h1 className="font-display text-[2.5rem] leading-[1.05] text-deep-maroon sm:text-[3.25rem] lg:text-[3.75rem]">
              Stop{" "}
              <em className="italic leading-[1.1] [padding-bottom:0.06em]">guessing</em> what to
              study for the UPCAT.
            </h1>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-6 max-w-[44ch] text-[1.05rem] leading-relaxed text-rosewood">
              One free, no-login mock that mirrors the real UPCAT. In under an hour, know exactly
              where you stand.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/diagnostic" className="btn-primary">
                Start the free mock
                <ArrowRight size={18} strokeWidth={2.25} />
              </Link>
              <a href="#diagnostic" className="btn-secondary">
                See a sample report
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="relative">
          <ReadinessReport />
        </Reveal>
      </div>
    </section>
  );
}
