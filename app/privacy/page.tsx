import type { Metadata } from "next";
import Disclaimer from "@/app/components/brand/Disclaimer";

export const metadata: Metadata = {
  title: "Privacy & disclaimer",
  description:
    "How Gabay handles your data, our use of cookies and Google Analytics with consent, and our independence from the University of the Philippines.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-clay-lg border-2 border-clay-line bg-cream p-7 shadow-clay">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-content px-5 py-14 lg:py-20">
      <h1 className="font-display text-h1 font-bold text-ink">Privacy &amp; Disclaimer</h1>
      <p className="mt-3 text-base text-ink-muted">
        Last updated: 2026. This page explains who Gabay is, how we handle your information, and the
        limits of what the diagnostic means.
      </p>

      <div className="mt-8">
        <Disclaimer />
      </div>

      <div className="mt-8 space-y-6">
        <Section title="Independence from the University of the Philippines">
          <p>
            Gabay is an independent UPCAT preparation tool. We are not affiliated with, endorsed by,
            or partnered with the University of the Philippines or the UP Office of Admissions. UPCAT
            is the admission test administered by UP; we reference it only to describe what Gabay
            helps you prepare for. We do not use UP&rsquo;s name, seal, logo, or official marks to
            imply any connection.
          </p>
        </Section>

        <Section title="Your diagnostic is study guidance, not a prediction">
          <p>
            The diagnostic gives a readiness signal based only on the answers you provide. It is not
            an admissions prediction and does not estimate your chances of being admitted anywhere.
            All questions are original practice questions written for Gabay. Use your results as a
            guide for what to study, not as a forecast of any exam outcome.
          </p>
        </Section>

        <Section title="What we store and where">
          <p>
            <strong className="text-ink">On your device (localStorage):</strong> your in-progress
            answers, your computed results, your 7-day study plan, an anonymous browser ID, and your
            cookie choice. This stays in your browser so you can leave and come back. You can clear it
            any time by clearing your browser data.
          </p>
          <p>
            <strong className="text-ink">In our database (only if you submit):</strong> when you
            finish a module we may save an anonymous diagnostic session (your answers and scores,
            tied to the anonymous browser ID, not your name). If you join the waitlist, we store the
            email and optional details you give us so we can contact you about Gabay.
          </p>
        </Section>

        <Section title="Cookies and Google Analytics (with your consent)">
          <p>
            We use Google Analytics 4 to understand, in aggregate, how students use Gabay (for
            example, how many people start and finish the diagnostic). Google Analytics is provided by
            Google, which acts as a data processor and may set cookies.
          </p>
          <p>
            <strong className="text-ink">Analytics loads only after you accept</strong> the cookie
            banner. If you decline, no Google Analytics script is loaded and no analytics cookies are
            set. You can change your mind by clearing your browser data, which resets the banner.
          </p>
        </Section>

        <Section title="Your choices">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Decline analytics cookies and still use every part of Gabay.</li>
            <li>Clear your browser data to remove locally stored results and reset consent.</li>
            <li>
              Ask us to remove your waitlist email by contacting us at the address below.
            </li>
          </ul>
        </Section>

        <Section title="Contact">
          <p>
            Questions about your data or this page? Email{" "}
            <a
              href="mailto:hello@gabay.com"
              className="font-semibold text-berry underline underline-offset-2"
            >
              hello@gabay.com
            </a>
            . We&rsquo;ll do our best to help.
          </p>
        </Section>
      </div>
    </div>
  );
}
