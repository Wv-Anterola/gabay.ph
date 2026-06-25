import { forwardRef, useId } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = ComponentPropsWithoutRef<"input"> & {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  trailing?: ReactNode;
};

/** Labeled input with persistent helper text + below-field error (a11y). */
const ClayInput = forwardRef<HTMLInputElement, Props>(function ClayInput(
  { label, hint, error, required, trailing, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span aria-hidden className="ml-1 text-berry">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hint ? hintId : "", error ? errorId : "") || undefined}
          className={cn(
            "min-h-[48px] w-full rounded-2xl border-2 bg-cream px-4 text-base text-ink placeholder:text-ink-faint",
            "transition-colors duration-200 focus:outline-none focus-visible:outline-3 focus-visible:outline-berry focus-visible:outline-offset-2",
            error ? "border-state-weak" : "border-clay-line focus:border-berry",
            trailing ? "pr-12" : "",
            className,
          )}
          {...rest}
        />
        {trailing ? (
          <span className="absolute inset-y-0 right-3 flex items-center text-ink-muted">
            {trailing}
          </span>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-state-weak">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export default ClayInput;
