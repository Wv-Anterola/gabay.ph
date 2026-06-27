import { BadgeCheck, Equal, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Status = "strong" | "steady" | "focus";

type StatusMeta = {
  label: string;
  Icon: LucideIcon;
  fill: number;
};

/*
  The product's core honesty rule: a diagnosis is NEVER carried by color
  alone. Every status pairs an icon + a written label + a redundant fill bar,
  so the reading is unmistakable for everyone, including color-blind users.
*/
const STATUS: Record<Status, StatusMeta> = {
  strong: { label: "Strong", Icon: BadgeCheck, fill: 86 },
  steady: { label: "Steady", Icon: Equal, fill: 61 },
  focus: { label: "Focus area", Icon: Target, fill: 37 },
};

type Subject = { name: string; status: Status };

const SUBJECTS: Subject[] = [
  { name: "Reading Comprehension", status: "strong" },
  { name: "Language Proficiency", status: "steady" },
  { name: "Science", status: "steady" },
  { name: "Mathematics", status: "focus" },
];

function SubjectRow({ subject }: { subject: Subject }) {
  const meta = STATUS[subject.status];
  const { Icon } = meta;
  const isFocus = subject.status === "focus";

  return (
    <li className="flex items-center gap-3 py-3">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-[14px] ${
          isFocus ? "bg-deep-maroon text-white" : "bg-maroon-mist text-deep-maroon"
        }`}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={2.25} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[0.9rem] font-medium text-deep-maroon">{subject.name}</p>
          <p className="shrink-0 text-[0.8rem] font-medium text-rosewood">{meta.label}</p>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-maroon-mist"
          role="img"
          aria-label={`${subject.name}: ${meta.label}`}
        >
          <div
            className="h-full rounded-full bg-deep-maroon"
            style={{ width: `${meta.fill}%` }}
          />
        </div>
      </div>
    </li>
  );
}

export default function ReadinessReport({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full rounded-[24px] bg-white p-5 sm:p-6 ${className}`}
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[0.8rem] font-medium text-rosewood">Sample readiness report</p>
        <span className="rounded-full bg-porcelain px-2.5 py-1 text-[0.7rem] font-medium text-rosewood ring-1 ring-rose-border">
          50 min
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 border-b border-rose-border pb-5">
        <div>
          <p className="font-display text-[2.75rem] leading-none text-deep-maroon">On track</p>
          <p className="mt-2 max-w-[24ch] text-[0.85rem] leading-relaxed text-rosewood">
            Steady across most areas, with one clear gap to close before exam day.
          </p>
        </div>
        <ReadinessOrb />
      </div>

      <ul className="divide-y divide-rose-border">
        {SUBJECTS.map((s) => (
          <SubjectRow key={s.name} subject={s} />
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2 rounded-[14px] bg-porcelain px-4 py-3">
        <Target size={18} strokeWidth={2.25} className="shrink-0 text-deep-maroon" />
        <p className="text-[0.82rem] leading-snug text-deep-maroon">
          <span className="font-medium">Start with Mathematics.</span>{" "}
          <span className="text-rosewood">It moves your score the most this week.</span>
        </p>
      </div>
    </div>
  );
}

/*
  The one decorative use of bright Maroon / Wine in the system: an abstract
  "readiness" orb (DESIGN.md's accent-orb motif). Purely illustrative, never
  an affordance.
*/
function ReadinessOrb() {
  return (
    <div
      className="size-16 shrink-0 rounded-full sm:size-20"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(circle at 32% 28%, #f3e6e8 0%, #9e2b25 38%, #800020 70%, #5c0a14 100%)",
        boxShadow: "0 8px 24px rgba(128, 0, 32, 0.28)",
      }}
    />
  );
}
