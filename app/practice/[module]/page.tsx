import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PracticeRunner from "@/app/components/practice/PracticeRunner";
import { MODULES, isModuleId } from "@/lib/questions";

export function generateStaticParams() {
  return Object.keys(MODULES).map((module) => ({ module }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module } = await params;
  if (!isModuleId(module)) return { title: "Practice" };
  return { title: `${MODULES[module].name} practice` };
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!isModuleId(module)) notFound();
  return <PracticeRunner module={module} />;
}
