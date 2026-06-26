import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Tero wordmark. Custom compass-style glyph (a "guide" mark) — original,
 * not based on any university seal or official mark.
 */
export default function Logo({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Tero home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-berry text-white shadow-clay-berry">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none">
          {/* Compass needle = "guide" */}
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 7.5l2.4 4.1-2.4 4.9-2.4-4.9z"
            fill="#E07B2C"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withWordmark ? (
        <span className="font-display text-xl font-bold tracking-tight text-ink">Tero</span>
      ) : null}
    </Link>
  );
}
