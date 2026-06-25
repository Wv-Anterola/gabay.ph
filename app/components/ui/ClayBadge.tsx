import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "berry" | "teal" | "mango" | "strong" | "steady" | "weak";

const tones: Record<Tone, string> = {
  neutral: "bg-cream text-ink border-clay-line",
  berry: "bg-berry-tint text-berry-deep border-berry-soft/40",
  teal: "bg-teal-tint text-teal-deep border-teal-soft/40",
  mango: "bg-mango-tint text-mango-deep border-mango/40",
  strong: "bg-teal-tint text-teal-deep border-teal-soft/40",
  steady: "bg-mango-tint text-mango-deep border-mango/40",
  weak: "bg-berry-tint text-berry-deep border-berry-soft/40",
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
