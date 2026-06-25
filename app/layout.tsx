import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/brand/Navbar";
import Footer from "@/app/components/brand/Footer";
import ConsentBanner from "@/app/components/brand/ConsentBanner";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gabay — Stop guessing what to study for UPCAT",
    template: "%s · Gabay",
  },
  description:
    "Gabay is an independent UPCAT preparation tool. Take a free diagnostic and get your weak-topic report and a 7-day study plan in minutes.",
  metadataBase: new URL("https://gabay.com"),
  openGraph: {
    title: "Gabay — Stop guessing what to study for UPCAT",
    description:
      "Free UPCAT diagnostic, weak-topic report, and a 7-day study plan. Independent UPCAT preparation tool for Filipino students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  );
}
