"use client";

import { cn } from "@/lib/cn";
import { useCountUp } from "@/app/components/shared/useCountUp";

type Tone = "berry" | "teal" | "mango" | "strong" | "steady" | "weak";

// Maroon system: accents collapse to Deep Maroon ink; strength is a monochrome
// value ramp (deep maroon → wine → dusty rose).
const strokes: Record<Tone, string> = {
  berry: "#5c0a14",
  teal: "#5c0a14",
  mango: "#5c0a14",
  strong: "#5c0a14",
  steady: "#9e2b25",
  weak: "#b89aa0",
};

/**
 * Accessible circular progress. The numeric value is rendered as text in the
 * middle, so the ring is never the only carrier of meaning.
 */
export default function ProgressRing({
  value,
  size = 96,
  stroke = 10,
  tone = "berry",
  label,
  className,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  tone?: Tone;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const animated = useCountUp(clamped, 1300);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (animated / 100) * c;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ? label + ": " : ""}${clamped} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3e6e8" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={strokes[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="tabular absolute text-lg font-bold text-ink">{Math.round(animated)}%</span>
    </div>
  );
}
