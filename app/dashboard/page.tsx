import type { Metadata } from "next";
import DashboardView from "@/app/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View previous Tero mock exam attempts, retake the mock, and open results.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
