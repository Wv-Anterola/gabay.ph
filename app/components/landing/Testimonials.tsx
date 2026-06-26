import { Quote } from "lucide-react";

/**
 * Illustrative sample stories. These are written examples of the experience
 * Tero aims to provide, not real student endorsements, and are clearly
 * labeled as such for honesty and brand safety.
 */
const STORIES = [
  {
    quote:
      "I always avoided math and just kept re-reading my language notes. The mock showed me my algebra was the real problem. Finally knew where to start.",
    name: "Sample story",
    role: "Grade 12, NCR",
    initials: "JR",
    tone: "berry",
  },
  {
    quote:
      "The 7-day plan made studying feel less scary. One topic a day, with practice questions right there. I stopped feeling like I was drowning in reviewers.",
    name: "Sample story",
    role: "Grade 11, Cebu",
    initials: "MA",
    tone: "teal",
  },
  {
    quote:
      "I liked that it did not over-promise results. It just told me honestly which topics were weak and let me practice them. That felt trustworthy.",
    name: "Sample story",
    role: "Gap year, Davao",
    initials: "KL",
    tone: "mango",
  },
];

const TONE_BG: Record<string, string> = {
  berry: "bg-berry text-white",
  teal: "bg-teal text-white",
  mango: "bg-mango text-ink",
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 bg-clay/50 py-16 lg:py-24">
      <div className="mx-auto max-w-wide px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-mango-deep">
            What studying with Tero feels like
          </p>
          <h2 className="mt-2 font-display text-h1 font-bold text-ink">
            Built to feel like a calm, honest guide.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STORIES.map((s, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-clay-lg border-2 border-clay-line bg-cream p-7"
            >
              <Quote aria-hidden className="h-8 w-8 text-mango" strokeWidth={1.5} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink">
                {s.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className={`tabular flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold ${TONE_BG[s.tone]}`}
                  aria-hidden
                >
                  {s.initials}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{s.name}</span>
                  <span className="block text-xs text-ink-muted">{s.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-6 text-xs text-ink-faint">
          Stories shown are illustrative examples of the Tero experience, not real student
          endorsements. We will only feature real testimonials with explicit consent.
        </p>
      </div>
    </section>
  );
}
