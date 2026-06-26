import { Shuffle, Clock, HelpCircle, ArrowRight } from "lucide-react";
import ClayCard from "@/app/components/ui/ClayCard";

const PAINS = [
  {
    icon: Shuffle,
    title: "Scattered reviewers",
    body: "Five PDFs, three notebooks, and random saved videos. No clear order, no sense of what matters most.",
  },
  {
    icon: HelpCircle,
    title: "No idea where you stand",
    body: "You study the topics you already like and avoid the ones you secretly dread. The gaps stay hidden.",
  },
  {
    icon: Clock,
    title: "Time slips away",
    body: "Weeks go by re-reading the same chapters while weak topics quietly stay weak until the exam.",
  },
];

export default function ProblemSection() {
  return (
    <section className="mx-auto max-w-wide px-5 py-16 lg:px-8 lg:py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-h1 font-bold text-ink">
          Self-study for UPCAT often feels like guessing.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Most students do not lack effort. They lack a clear sense of what to study first. Tero
          replaces the scramble with a clear starting point.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PAINS.map((p) => (
          <ClayCard key={p.title} tone="cream" className="p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-berry-tint text-berry">
              <p.icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.body}</p>
          </ClayCard>
        ))}
      </div>

      <div className="mt-8 inline-flex items-center gap-2 rounded-clay border-2 border-teal-soft/30 bg-teal-tint px-5 py-3">
        <ArrowRight aria-hidden className="h-5 w-5 text-teal-deep" strokeWidth={2} />
        <p className="text-sm font-semibold text-teal-deep">
          Tero turns &ldquo;study everything&rdquo; into &ldquo;study this first.&rdquo;
        </p>
      </div>
    </section>
  );
}
