import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "berry";
type Size = "md" | "lg";

const base =
  "clay-press inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight " +
  "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

const sizes: Record<Size, string> = {
  md: "min-h-[44px] px-5 text-sm",
  lg: "min-h-[52px] px-7 text-base",
};

const variants: Record<Variant, string> = {
  // Mango is reserved for the single primary action per screen.
  primary: "bg-mango text-ink shadow-clay-mango hover:bg-mango-deep hover:text-white",
  berry: "bg-berry text-white shadow-clay-berry hover:bg-berry-deep",
  secondary: "border-2 border-clay-line bg-clay text-ink shadow-clay-sm hover:bg-clay-deep",
  ghost: "text-berry hover:bg-clay",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonProps = CommonProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };
type AnchorProps = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className"
  >;

export default function ClayButton(props: ButtonProps | AnchorProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, sizes[size], variants[variant], className);

  if ("href" in props && props.href) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } =
    props as ButtonProps;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
