import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/app/components/shared/Reveal";

export default function FinalCTA() {
  return (
    <section id="start" className="mx-auto max-w-content scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
      <div className="relative overflow-hidden rounded-[24px] bg-deep-maroon px-6 py-16 text-center sm:px-12 lg:py-24">
        {/* Decorative accent orb — the one bright-maroon flourish. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(158,43,37,0.9) 0%, rgba(128,0,32,0) 70%)",
          }}
        />

        <div className="relative mx-auto max-w-[34ch]">
          <Reveal>
            <h2 className="font-display text-[2.25rem] leading-[1.08] text-white sm:text-[3rem]">
              Spend the next hour finding out, not worrying.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mx-auto mt-5 max-w-[46ch] text-[1.05rem] leading-relaxed text-white/75">
              Take the free mock and walk away knowing exactly where you stand and what to do next.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <Link
              href="/diagnostic"
              className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-medium text-deep-maroon transition-transform duration-200 ease-out hover:bg-porcelain active:scale-[0.97]"
            >
              Start the free mock
              <ArrowRight size={18} strokeWidth={2.25} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
