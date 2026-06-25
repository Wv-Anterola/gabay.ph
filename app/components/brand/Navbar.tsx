"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "./Logo";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#modules", label: "UPCAT modules" },
  { href: "/diagnostic", label: "Diagnostic" },
  { href: "/waitlist", label: "Waitlist" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[500] border-b-2 border-clay-line/70 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-wide items-center gap-4 px-5 py-3 lg:px-8">
        <Logo />

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/diagnostic"
                ? pathname.startsWith("/diagnostic")
                : link.href === "/waitlist"
                  ? pathname.startsWith("/waitlist")
                  : false;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold text-ink-muted transition-colors hover:bg-clay hover:text-ink",
                    active && "bg-clay text-berry",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto lg:ml-0">
          <Link
            href="/diagnostic"
            onClick={() => trackEvent("cta_click", { location: "navbar", cta: "diagnostic" })}
            className="clay-press hidden items-center gap-2 rounded-2xl bg-mango px-5 py-2.5 text-sm font-semibold text-ink shadow-clay-mango hover:bg-mango-deep hover:text-white sm:inline-flex"
          >
            Take the free diagnostic
            <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="clay-press flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-clay-line bg-clay text-ink lg:hidden"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t-2 border-clay-line/70 bg-cream px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-clay"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/diagnostic"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-2xl bg-mango px-4 py-3 text-center text-sm font-semibold text-ink"
              >
                Take the free UPCAT diagnostic
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
