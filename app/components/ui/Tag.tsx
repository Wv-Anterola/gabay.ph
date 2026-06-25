import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small topic/subtopic chip used in results and practice. */
export default function Tag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-clay-line bg-cream px-2.5 py-1 text-xs font-medium text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
