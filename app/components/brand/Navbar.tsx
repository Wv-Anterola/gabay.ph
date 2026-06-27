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
  { href: "/diagnostic", label: "Mock exam" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/waitlist", label: "Waitlist" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[500] border-b border-rose-border bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-content items-center gap-4 px-5 py-3 lg:px-8">
        <Logo />

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/diagnostic"
                ? pathname.startsWith("/diagnostic")
                : link.href === "/dashboard"
                  ? pathname.startsWith("/dashboard")
                  : link.href === "/waitlist"
                  ? pathname.startsWith("/waitlist")
                  : false;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium text-rosewood transition-colors hover:bg-maroon-mist hover:text-deep-maroon",
                    active && "bg-maroon-mist text-deep-maroon",
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
            className="btn-primary hidden text-sm sm:inline-flex"
          >
            Take the free mock
            <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-border bg-white text-deep-maroon transition-transform active:scale-95 lg:hidden"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-rose-border bg-white px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-full px-4 py-3 text-sm font-medium text-deep-maroon hover:bg-maroon-mist"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/diagnostic"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-deep-maroon px-4 py-3 text-center text-sm font-medium text-white"
              >
                Take the free UPCAT mock
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
