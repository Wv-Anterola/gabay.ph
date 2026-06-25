import type { Metadata } from "next";
import DiagnosticIntro from "@/app/components/diagnostic/DiagnosticIntro";
import ModulePicker from "@/app/components/diagnostic/ModulePicker";
import Disclaimer from "@/app/components/brand/Disclaimer";
import TrackView from "@/app/components/shared/TrackView";

export const metadata: Metadata = {
  title: "Take the free UPCAT diagnostic",
  description:
    "Start your free UPCAT diagnostic. Short mini-tests across Language, Reading, Math, and Science with original practice questions.",
};

export default function DiagnosticPage() {
  return (
    <div className="mx-auto max-w-wide px-5 py-12 lg:px-8 lg:py-16">
      <TrackView event="diagnostic_started" />
      <DiagnosticIntro />

      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-mango-deep">
          Choose a module to start
        </h2>
        <div className="mt-5">
          <ModulePicker />
        </div>
      </div>

      <div className="mt-10">
        <Disclaimer />
      </div>
    </div>
  );
}
