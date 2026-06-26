import Link from "next/link";
import Logo from "./Logo";
import Disclaimer from "./Disclaimer";

const COLS = [
  {
    title: "Product",
    links: [
      { href: "/diagnostic", label: "Free UPCAT mock exam" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/#modules", label: "UPCAT modules" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/waitlist", label: "Join the waitlist" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/privacy", label: "Privacy & disclaimer" },
      { href: "/#testimonials", label: "Student stories" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-clay-line bg-clay/60">
      <div className="mx-auto max-w-wide px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Tero (&ldquo;guide&rdquo;) helps Filipino students stop guessing what to study for
              UPCAT. Free mock exam, answer review, weak-topic report, and a 7-day study plan.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Built for UPCAT first. More CETs coming later.
            </p>
          </div>

          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-bold text-ink">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors hover:text-berry"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12">
          <Disclaimer />
        </div>

        <p className="mt-8 text-xs text-ink-faint">
          © {new Date().getFullYear()} Tero. An independent UPCAT preparation tool. UPCAT is the
          admission test of the University of the Philippines; Tero is not affiliated with or
          endorsed by UP.
        </p>
      </div>
    </footer>
  );
}
