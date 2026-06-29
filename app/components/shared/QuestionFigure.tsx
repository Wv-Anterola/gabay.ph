import type { Question } from "@/lib/types";
import { cn } from "@/lib/cn";

export default function QuestionFigure({
  image,
  surface = "clay",
  className,
}: {
  image?: Question["image"];
  surface?: "clay" | "cream";
  className?: string;
}) {
  if (!image) return null;

  return (
    <figure
      className={cn(
        "mt-4 rounded-clay border border-clay-line px-4 py-4",
        surface === "cream" ? "bg-cream" : "bg-clay",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        className="max-h-80 w-full rounded-xl object-contain"
      />
      {image.caption ? (
        <figcaption className="mt-2 text-xs text-ink-muted">{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}
