import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import type { ChoiceId, Difficulty, ModuleId, Question } from "@/lib/types";

type ImportedChoice = { id: ChoiceId; text: string };

export type ImportedQuestion = Omit<Question, "module" | "stem" | "estimatedTimeSeconds" | "sourceType" | "reviewStatus"> & {
  section: ModuleId;
  question: string;
  estimated_time: number;
  passage?: string;
};

const SECTION_ALIASES: Record<string, ModuleId> = {
  language: "language",
  "language proficiency": "language",
  reading: "reading",
  "reading comprehension": "reading",
  math: "math",
  mathematics: "math",
  science: "science",
};

const CHOICE_IDS: ChoiceId[] = ["a", "b", "c", "d"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function parseFrontmatter(source: string, filePath: string): { attrs: Record<string, string>; body: string } {
  if (!source.startsWith("---\n")) {
    throw new Error(`${filePath}: missing frontmatter block`);
  }
  const end = source.indexOf("\n---", 4);
  if (end === -1) throw new Error(`${filePath}: unterminated frontmatter block`);

  const attrs: Record<string, string> = {};
  const raw = source.slice(4, end).split("\n");
  for (const line of raw) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const split = trimmed.indexOf(":");
    if (split === -1) throw new Error(`${filePath}: invalid frontmatter line "${line}"`);
    const key = trimmed.slice(0, split).trim();
    const value = trimmed.slice(split + 1).trim().replace(/^["']|["']$/g, "");
    attrs[key] = value;
  }

  return { attrs, body: source.slice(end + 4).trim() };
}

function sectionBody(body: string, heading: string): string {
  const pattern = new RegExp(`^## ${heading}\\s*$`, "im");
  const match = body.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const next = rest.search(/^##\s+/m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

function parseChoices(raw: string, filePath: string): ImportedChoice[] {
  const choices = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([A-Da-d])[\).\s-]+(.+)$/);
      if (!match) throw new Error(`${filePath}: invalid choice line "${line}"`);
      return { id: match[1].toLowerCase() as ChoiceId, text: match[2].trim() };
    });

  for (const id of CHOICE_IDS) {
    if (!choices.some((choice) => choice.id === id)) {
      throw new Error(`${filePath}: missing choice ${id.toUpperCase()}`);
    }
  }
  return choices;
}

export function parseQuestionMarkdown(source: string, filePath = "question.md"): ImportedQuestion {
  const { attrs, body } = parseFrontmatter(source, filePath);
  const section = SECTION_ALIASES[(attrs.section ?? "").toLowerCase()];
  const difficulty = attrs.difficulty as Difficulty;
  const answer = (attrs.answer ?? "").toLowerCase() as ChoiceId;
  const estimated = Number(attrs.estimated_time);
  const question = sectionBody(body, "Question");
  const explanation = sectionBody(body, "Explanation");
  const choices = parseChoices(sectionBody(body, "Choices"), filePath);
  const passage = sectionBody(body, "Passage") || undefined;

  if (!attrs.id) throw new Error(`${filePath}: missing id`);
  if (!section) throw new Error(`${filePath}: invalid section`);
  if (!attrs.topic) throw new Error(`${filePath}: missing topic`);
  if (!DIFFICULTIES.includes(difficulty)) throw new Error(`${filePath}: invalid difficulty`);
  if (!CHOICE_IDS.includes(answer)) throw new Error(`${filePath}: invalid answer`);
  if (!Number.isFinite(estimated) || estimated <= 0) {
    throw new Error(`${filePath}: estimated_time must be a positive number`);
  }
  if (!question) throw new Error(`${filePath}: missing ## Question body`);
  if (!explanation) throw new Error(`${filePath}: missing ## Explanation body`);
  if (attrs.image_src && !attrs.image_alt) {
    throw new Error(`${filePath}: image_alt is required when image_src is present`);
  }

  return {
    id: attrs.id,
    section,
    topic: attrs.topic,
    subtopic: attrs.subtopic || undefined,
    difficulty,
    question,
    passage,
    passageId: attrs.passage_id || undefined,
    image: attrs.image_src
      ? {
          src: attrs.image_src,
          alt: attrs.image_alt,
          caption: attrs.image_caption || undefined,
        }
      : undefined,
    choices,
    answer,
    explanation,
    estimated_time: estimated,
    tags: attrs.tags ? attrs.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : undefined,
  };
}

function questionToRuntime(q: ImportedQuestion): Question {
  return {
    id: q.id,
    module: q.section,
    topic: q.topic,
    subtopic: q.subtopic,
    difficulty: q.difficulty,
    stem: q.question,
    passageId: q.passageId,
    image: q.image,
    choices: q.choices,
    answer: q.answer,
    explanation: q.explanation,
    estimatedTimeSeconds: q.estimated_time,
    sourceType: "original_generated",
    reviewStatus: "needs_review",
    tags: q.tags,
  };
}

function walkMarkdown(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(path);
    return entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md" ? [path] : [];
  });
}

export function parseQuestionFiles(files: string[]): Question[] {
  const seen = new Set<string>();
  return files.map((file) => {
    const imported = parseQuestionMarkdown(readFileSync(file, "utf8"), file);
    if (seen.has(imported.id)) throw new Error(`${file}: duplicate id ${imported.id}`);
    seen.add(imported.id);
    return questionToRuntime(imported);
  });
}

function generateSource(questions: Question[]): string {
  return `import type { Question } from "@/lib/types";\n\nexport const importedQuestions: Question[] = ${JSON.stringify(
    questions,
    null,
    2,
  )};\n`;
}

function main() {
  const inputDir = process.argv[2] ?? "question-bank";
  const outputFile = process.argv[3] ?? "lib/questions/imported.ts";
  const files = walkMarkdown(inputDir);
  const questions = parseQuestionFiles(files);
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, generateSource(questions));
  console.log(
    `Imported ${questions.length} question(s) from ${relative(process.cwd(), inputDir)} to ${relative(
      process.cwd(),
      outputFile,
    )}`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
