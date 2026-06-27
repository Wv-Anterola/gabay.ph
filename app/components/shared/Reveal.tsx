"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Reveals its children with a fade-up as they scroll into view.
 *
 * Default-visible by design: content always renders visible for SSR, crawlers,
 * and no-JS clients. Only AFTER hydration does JS hide elements that are still
 * off-screen, then fade them in on scroll. Elements already in the viewport on
 * load (e.g. the hero / LCP) are never hidden — they show immediately.
 *
 * - Respects prefers-reduced-motion: reduced-motion users see content immediately.
 * - Falls back to visible if IntersectionObserver is unavailable.
 * - `delay` (ms) staggers siblings; `as` swaps the wrapper element.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  // "visible" is the SSR/no-JS default — content is never gated behind JS.
  const [state, setState] = useState<"visible" | "hidden" | "revealed">("visible");

  useEffect(() => {
    if (reduced || typeof IntersectionObserver === "undefined") return; // stay visible
    const el = ref.current;
    if (!el) return;

    // Already on-screen (hero/LCP, or anything above the fold)? Leave it visible
    // immediately — no hide, no entrance animation, nothing to block paint.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) return;

    // Off-screen: safe to hide now (the user can't see it) and fade it in when
    // it scrolls into view.
    setState("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("revealed");
            if (once) observer.disconnect();
          } else if (!once) {
            setState("hidden");
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, once]);

  return (
    <Tag
      ref={ref}
      className={cn(
        state === "hidden" && "opacity-0",
        state === "revealed" && "animate-fade-up",
        className,
      )}
      style={state === "revealed" && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
