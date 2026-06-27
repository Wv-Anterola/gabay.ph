import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "clay" | "cream" | "berry" | "teal";

const tones: Record<Tone, string> = {
  clay: "bg-clay border-clay-line",
  cream: "bg-cream border-clay-line",
  berry: "bg-berry text-white border-berry-deep",
  teal: "bg-teal text-white border-teal-deep",
};

export default function ClayCard({
  children,
  tone = "clay",
  interactive = false,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  interactive?: boolean;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "rounded-clay border shadow-clay",
        tones[tone],
        interactive && "clay-press hover:shadow-clay-lg",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
