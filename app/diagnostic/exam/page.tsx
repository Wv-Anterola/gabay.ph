import type { Metadata } from "next";
import MockExamRunner from "@/app/components/diagnostic/MockExamRunner";
import { getMockExamSections } from "@/lib/mockExam";

export const metadata: Metadata = {
  title: "UPCAT mock exam",
  description: "Complete the full Tero UPCAT mock exam and submit for your readiness score.",
};

export default function MockExamPage() {
  return <MockExamRunner sections={getMockExamSections()} />;
}
