import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "berry" | "teal" | "mango" | "strong" | "steady" | "weak";

/*
  Strength is encoded by VALUE/emphasis, never hue (DESIGN.md: convey state
  through maroon tints, weight, and tone). A 3-step ramp: filled deep-maroon
  (strong) → soft maroon-mist (steady) → quiet outline (weak). Always paired
  with a written label + icon at the call site, so it never relies on color.
  Legacy hue aliases (teal/mango/berry) map onto the same ramp.
*/
const tones: Record<Tone, string> = {
  neutral: "bg-porcelain text-rosewood border-rose-border",
  strong: "bg-deep-maroon text-white border-transparent",
  steady: "bg-maroon-mist text-deep-maroon border-rose-border",
  weak: "bg-white text-rosewood border-rose-border",
  teal: "bg-deep-maroon text-white border-transparent",
  mango: "bg-maroon-mist text-deep-maroon border-rose-border",
  berry: "bg-white text-rosewood border-rose-border",
};

export default function ClayBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-tight",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
