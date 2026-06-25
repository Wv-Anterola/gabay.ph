import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModuleRunner from "@/app/components/diagnostic/ModuleRunner";
import { MODULES, getModuleQuestions, isModuleId } from "@/lib/questions";

export function generateStaticParams() {
  return Object.keys(MODULES).map((module) => ({ module }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module } = await params;
  if (!isModuleId(module)) return { title: "Diagnostic" };
  return { title: `${MODULES[module].name} diagnostic` };
}

export default async function ModuleDiagnosticPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!isModuleId(module)) notFound();

  const questions = getModuleQuestions(module);
  if (questions.length === 0) notFound();

  return <ModuleRunner module={module} questions={questions} />;
}
