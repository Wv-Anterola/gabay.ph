import Reveal from "@/app/components/shared/Reveal";

export default function ProblemPromise() {
  return (
    <section className="bg-porcelain">
      <div className="mx-auto max-w-[820px] px-5 py-24 text-center sm:px-8 lg:py-32">
        <Reveal>
          <p className="font-display text-[1.75rem] leading-[1.32] text-deep-maroon sm:text-[2.25rem] sm:leading-[1.3]">
            You can&rsquo;t review everything before exam day. The hard part isn&rsquo;t studying
            harder, it&rsquo;s knowing{" "}
            <span className="text-rosewood">what to study first.</span>
          </p>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-7 max-w-[58ch] text-[1.05rem] leading-relaxed text-rosewood">
            Tero replaces anxiety and aimless cramming with evidence. One honest mock turns your
            raw answers into a clear picture of where you stand, then hands you a plan for the
            topics that matter most.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
