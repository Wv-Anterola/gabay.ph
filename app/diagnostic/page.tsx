import type { Metadata } from "next";
import MockExamStart from "@/app/components/diagnostic/MockExamStart";
import Disclaimer from "@/app/components/brand/Disclaimer";
import TrackView from "@/app/components/shared/TrackView";

export const metadata: Metadata = {
  title: "Take the free UPCAT mock exam",
  description:
    "Start your free UPCAT mock exam across Language, Reading, Math, and Science with original practice questions.",
};

export default function DiagnosticPage() {
  return (
    <>
      <TrackView event="diagnostic_started" />
      <MockExamStart />
      <div className="mx-auto max-w-wide px-5 lg:px-8">
        <Disclaimer />
      </div>
    </>
  );
}
