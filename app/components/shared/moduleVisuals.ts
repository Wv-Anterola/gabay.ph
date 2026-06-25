import { BookOpenText, BookMarked, Calculator, FlaskConical } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ModuleId, ReadinessLevel } from "@/lib/types";

export const MODULE_ICON: Record<ModuleId, LucideIcon> = {
  language: BookOpenText,
  reading: BookMarked,
  math: Calculator,
  science: FlaskConical,
};

/** Tailwind classes for the soft module accent (icon chip background/text). */
export const MODULE_ACCENT: Record<ModuleId, string> = {
  language: "bg-berry-tint text-berry",
  reading: "bg-teal-tint text-teal-deep",
  math: "bg-mango-tint text-mango-deep",
  science: "bg-clay-deep text-ink",
};

export const READINESS_TONE: Record<ReadinessLevel, "strong" | "steady" | "weak"> = {
  strong: "strong",
  steady: "steady",
  needs_work: "weak",
};

export const READINESS_RING_TONE: Record<ReadinessLevel, "strong" | "steady" | "weak"> = {
  strong: "strong",
  steady: "steady",
  needs_work: "weak",
};
