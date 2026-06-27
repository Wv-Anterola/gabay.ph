import { Sigma, FlaskConical, BookOpen, Languages } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "@/app/components/shared/Reveal";

type Area = {
  name: string;
  blurb: string;
  Icon: LucideIcon;
  span: string;
  surface: "gradient" | "porcelain" | "white" | "maroon";
};

const AREAS: Area[] = [
  {
    name: "Mathematics",
    blurb:
      "Algebra, geometry, and the word problems that decide more scores than any other single skill.",
    Icon: Sigma,
    span: "lg:col-span-3",
    surface: "gradient",
  },
  {
    name: "Science",
    blurb: "Reasoning across biology, chemistry, and physics, not memorized trivia.",
    Icon: FlaskConical,
    span: "lg:col-span-3",
    surface: "white",
  },
  {
    name: "Language Proficiency",
    blurb: "Grammar, usage, and the small mechanics that add up fast.",
    Icon: Languages,
    span: "lg:col-span-2",
    surface: "white",
  },
  {
    name: "Reading Comprehension",
    blurb:
      "Pulling meaning, inference, and intent from passages under real time pressure.",
    Icon: BookOpen,
    span: "lg:col-span-4",
    surface: "maroon",
  },
];

function surfaceClasses(surface: Area["surface"]) {
  if (surface === "maroon") return "bg-deep-maroon";
  if (surface === "porcelain") return "bg-porcelain ring-1 ring-rose-border";
  return "bg-white ring-1 ring-rose-border";
}

export default function Areas() {
  return (
    <section id="modules" className="scroll-mt-24 bg-porcelain">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 lg:py-32">
        <div className="max-w-[48ch]">
          <Reveal>
            <h2 className="font-display text-[2rem] leading-[1.1] text-deep-maroon sm:text-[2.5rem]">
              The same four areas as the real test.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-rosewood">
              One sitting covers every section the UPCAT does, so your readiness signal reflects
              the exam you&rsquo;ll actually face.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-6">
          {AREAS.map((area, i) => {
            const { Icon } = area;
            const isGradient = area.surface === "gradient";
            const isDark = area.surface === "maroon";
            return (
              <Reveal key={area.name} delay={i * 70} className={area.span}>
                <div
                  className={`relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-[20px] p-7 ${surfaceClasses(
                    area.surface,
                  )}`}
                >
                  {isGradient && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-90 blur-2xl"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(158,43,37,0.22) 0%, rgba(128,0,32,0.05) 55%, transparent 75%)",
                      }}
                    />
                  )}
                  <span
                    className={`relative grid size-12 place-items-center rounded-[14px] ${
                      isDark ? "bg-white/15 text-white" : "bg-maroon-mist text-deep-maroon"
                    }`}
                    aria-hidden="true"
                  >
                    <Icon size={24} strokeWidth={2.25} />
                  </span>
                  <div className="relative mt-8">
                    <h3
                      className={`text-[1.2rem] font-medium ${
                        isDark ? "text-white" : "text-deep-maroon"
                      }`}
                    >
                      {area.name}
                    </h3>
                    <p
                      className={`mt-2 max-w-[42ch] text-[0.95rem] leading-relaxed ${
                        isDark ? "text-white/80" : "text-rosewood"
                      }`}
                    >
                      {area.blurb}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
