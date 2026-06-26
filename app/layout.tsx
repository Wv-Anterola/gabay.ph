import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import Navbar from "@/app/components/brand/Navbar";
import Footer from "@/app/components/brand/Footer";
import ConsentBanner from "@/app/components/brand/ConsentBanner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tero — Free online UPCAT mock exam",
    template: "%s · Tero",
  },
  description:
    "Tero is an independent UPCAT preparation tool. Take a free mock exam, get your readiness score, and review every missed answer.",
  metadataBase: new URL("https://tero.ph"),
  openGraph: {
    title: "Tero — Free online UPCAT mock exam",
    description:
      "Free UPCAT mock exam, readiness score, answer review, weak-topic report, and study plan. Independent UPCAT preparation tool for Filipino students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
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
