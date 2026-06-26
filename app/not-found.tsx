import ClayButton from "@/app/components/ui/ClayButton";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-5 py-24 text-center lg:py-32">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-clay border-2 border-clay-line bg-clay text-berry shadow-clay">
        <Compass aria-hidden className="h-8 w-8" strokeWidth={1.75} />
      </span>
      <h1 className="mt-6 font-display text-h1 font-bold text-ink">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-base text-ink-muted">
        That page wandered off. Let&rsquo;s get you back to studying for UPCAT.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
        <ClayButton href="/" variant="primary">
          Back to home
        </ClayButton>
        <ClayButton href="/diagnostic" variant="secondary">
          Take the mock exam
        </ClayButton>
      </div>
    </div>
  );
}
