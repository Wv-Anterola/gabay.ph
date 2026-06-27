import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Tero wordmark — ElevenLabs-style stamp: a deep-maroon double-bar glyph
 * ('||') paired with the wordmark in the Figtree display face.
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
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span aria-hidden className="text-[1.15rem] font-medium leading-none text-deep-maroon">
        ||
      </span>
      {withWordmark ? (
        <span className="font-display text-[1.2rem] font-medium tracking-[0.04em] text-deep-maroon">
          Tero
        </span>
      ) : null}
    </Link>
  );
}
