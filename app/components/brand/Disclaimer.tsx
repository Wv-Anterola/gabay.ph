import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

export const DISCLAIMER_TEXT =
  "Tero is an independent UPCAT preparation tool and is not affiliated with the University of the Philippines or the UP Office of Admissions. This mock exam is not an admissions prediction. Results are study guidance only. Questions are original practice questions.";

/**
 * The required independence disclaimer. Rendered on the homepage footer,
 * mock exam start, results page, and privacy page.
 */
export default function Disclaimer({
  variant = "card",
  className,
}: {
  variant?: "card" | "plain";
  className?: string;
}) {
  if (variant === "plain") {
    return (
      <p className={cn("text-xs leading-relaxed text-ink-muted", className)}>{DISCLAIMER_TEXT}</p>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-clay border-2 border-clay-line bg-clay/70 px-5 py-4",
        className,
      )}
    >
      <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-berry" strokeWidth={1.75} />
      <p className="text-sm leading-relaxed text-ink-muted">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
