import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import type {
  ChoiceId,
  Difficulty,
  ModuleId,
  Passage,
  Question,
  QuestionBank,
  ReviewStatus,
} from "@/lib/types";
import {
  CORE_MATH_DIAGRAMS,
  parseMathDiagramSpec,
  renderMathDiagram,
  type MathDiagramSpec,
} from "./math-diagrams";

type ImportedChoice = { id: ChoiceId; text: string };

export type ImportedQuestion = Omit<
  Question,
  "module" | "stem" | "estimatedTimeSeconds" | "sourceType" | "reviewStatus"
> & {
  section: ModuleId;
  question: string;
  estimated_time: number;
  passage?: string;
  bankId: string;
  reviewStatus: ReviewStatus;
  diagram?: MathDiagramSpec;
};

/** A passage parsed from a set's header block. */
export type ImportedPassage = Passage & { bankId: string };

export type ParsedFile = {
  questions: ImportedQuestion[];
  passages: ImportedPassage[];
  /** Optional bank metadata declared in a file (name / description). */
  bankMeta: Array<{ id: string; name?: string; description?: string }>;
};

/** Defaults a question block inherits from a set's header block. */
type BlockDefaults = {
  bankId?: string;
  section?: string;
  passageId?: string;
  reviewStatus?: string;
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
const REVIEW_STATUSES: ReviewStatus[] = ["needs_review", "approved", "rejected"];

const DEFAULT_BANK_ID = "default";
const DEFAULT_ASSET_OUTPUT_DIR = "public/questions";
const PUBLIC_QUESTION_ASSET_PREFIX = "/questions";

function slugifyBank(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleizeBank(id: string): string {
  return id
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseFrontmatter(
  source: string,
  filePath: string,
): { attrs: Record<string, string>; body: string } {
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

function questionDiagramSrc(bankId: string, questionId: string): string {
  return `${PUBLIC_QUESTION_ASSET_PREFIX}/${bankId}/${questionId}.svg`;
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

/** Split a file into blocks separated by a line that is exactly `===`. */
function splitBlocks(source: string): string[] {
  return source
    .split(/^===\s*$/m)
    .map((block) => block.trim())
    .filter(Boolean);
}

/** A block is a passage header when it defines a passage but no question. */
function isPassageHeader(body: string): boolean {
  return Boolean(sectionBody(body, "Passage")) && !sectionBody(body, "Question");
}

function resolveBankId(
  attrs: Record<string, string>,
  defaults: BlockDefaults,
  folderBankId: string,
): string {
  const raw = attrs.bank ?? defaults.bankId ?? folderBankId;
  return slugifyBank(raw) || DEFAULT_BANK_ID;
}

function parseQuestionBlock(
  block: string,
  filePath: string,
  defaults: BlockDefaults,
  folderBankId: string,
): ImportedQuestion {
  const { attrs, body } = parseFrontmatter(block, filePath);
  const bankId = resolveBankId(attrs, defaults, folderBankId);
  const sectionRaw = (attrs.section ?? defaults.section ?? "").toLowerCase();
  const section = SECTION_ALIASES[sectionRaw];
  const difficulty = attrs.difficulty as Difficulty;
  const answer = (attrs.answer ?? "").toLowerCase() as ChoiceId;
  const estimated = Number(attrs.estimated_time);
  const question = sectionBody(body, "Question");
  const diagramRaw = sectionBody(body, "Diagram");
  const explanation = sectionBody(body, "Explanation");
  const choices = parseChoices(sectionBody(body, "Choices"), filePath);
  const passageInline = sectionBody(body, "Passage") || undefined;
  const passageId = attrs.passage_id || defaults.passageId || undefined;
  const reviewStatus = (attrs.review_status ??
    defaults.reviewStatus ??
    "needs_review") as ReviewStatus;

  if (!attrs.id) throw new Error(`${filePath}: missing id`);
  if (!section) throw new Error(`${filePath}: invalid section`);
  if (!attrs.topic) throw new Error(`${filePath}: missing topic`);
  if (!DIFFICULTIES.includes(difficulty)) throw new Error(`${filePath}: invalid difficulty`);
  if (!CHOICE_IDS.includes(answer)) throw new Error(`${filePath}: invalid answer`);
  if (!REVIEW_STATUSES.includes(reviewStatus)) {
    throw new Error(`${filePath}: invalid review_status "${attrs.review_status}"`);
  }
  if (!Number.isFinite(estimated) || estimated <= 0) {
    throw new Error(`${filePath}: estimated_time must be a positive number`);
  }
  if (!question) throw new Error(`${filePath}: missing ## Question body`);
  if (!explanation) throw new Error(`${filePath}: missing ## Explanation body`);
  if (attrs.image_src && !attrs.image_alt) {
    throw new Error(`${filePath}: image_alt is required when image_src is present`);
  }
  if (diagramRaw && attrs.image_src) {
    throw new Error(`${filePath}: use either ## Diagram or image_src, not both`);
  }
  if (diagramRaw && !attrs.diagram_alt) {
    throw new Error(`${filePath}: diagram_alt is required when ## Diagram is present`);
  }

  const diagram = diagramRaw
    ? parseMathDiagramSpec(diagramRaw, { filePath, questionId: attrs.id })
    : undefined;

  return {
    id: attrs.id,
    bankId,
    section,
    topic: attrs.topic,
    subtopic: attrs.subtopic || undefined,
    difficulty,
    question,
    passage: passageInline,
    passageId,
    image: attrs.image_src
      ? {
          src: attrs.image_src,
          alt: attrs.image_alt,
          caption: attrs.image_caption || undefined,
        }
      : diagram
        ? {
            src: questionDiagramSrc(bankId, attrs.id),
            alt: attrs.diagram_alt,
            caption: attrs.diagram_caption || undefined,
          }
      : undefined,
    diagram,
    choices,
    answer,
    explanation,
    estimated_time: estimated,
    reviewStatus,
    tags: attrs.tags
      ? attrs.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : undefined,
  };
}

/**
 * Parse a single Markdown file. Supports three shapes:
 *  - one question (one block)
 *  - several standalone questions (blocks separated by `===`)
 *  - a passage set (first block is a `## Passage` header, the rest are
 *    questions that inherit the header's bank/section/passage_id)
 */
export function parseQuestionFile(
  source: string,
  filePath = "question.md",
  folderBankId: string = DEFAULT_BANK_ID,
): ParsedFile {
  const blocks = splitBlocks(source);
  if (blocks.length === 0) throw new Error(`${filePath}: no question blocks found`);

  const questions: ImportedQuestion[] = [];
  const passages: ImportedPassage[] = [];
  const bankMeta: ParsedFile["bankMeta"] = [];

  const first = parseFrontmatter(blocks[0], filePath);
  let defaults: BlockDefaults = {};
  let questionBlocks = blocks;

  if (isPassageHeader(first.body)) {
    const attrs = first.attrs;
    const passageId = attrs.passage_id;
    if (!passageId) throw new Error(`${filePath}: passage header is missing passage_id`);
    const bankId = resolveBankId(attrs, {}, folderBankId);
    defaults = {
      bankId,
      section: attrs.section,
      passageId,
      reviewStatus: attrs.review_status,
    };
    passages.push({
      id: passageId,
      title: attrs.passage_title || titleizeBank(passageId),
      body: sectionBody(first.body, "Passage"),
      bankId,
    });
    if (attrs.bank_name || attrs.bank_description) {
      bankMeta.push({ id: bankId, name: attrs.bank_name, description: attrs.bank_description });
    }
    questionBlocks = blocks.slice(1);
    if (questionBlocks.length === 0) {
      throw new Error(`${filePath}: passage set has no question blocks`);
    }
  }

  for (const block of questionBlocks) {
    const question = parseQuestionBlock(block, filePath, defaults, folderBankId);
    questions.push(question);
    // Allow a standalone question block to declare bank metadata too.
    const { attrs } = parseFrontmatter(block, filePath);
    if (attrs.bank_name || attrs.bank_description) {
      bankMeta.push({
        id: question.bankId,
        name: attrs.bank_name,
        description: attrs.bank_description,
      });
    }
  }

  return { questions, passages, bankMeta };
}

function questionToRuntime(q: ImportedQuestion): Question {
  return {
    id: q.id,
    module: q.section,
    bankId: q.bankId,
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
    reviewStatus: q.reviewStatus,
    tags: q.tags,
  };
}

function walkMarkdown(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(path);
    return entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md"
      ? [path]
      : [];
  });
}

/** Top-level folder under `inputDir` becomes the default bank id for a file. */
function folderBankIdFor(inputDir: string, file: string): string {
  const rel = relative(inputDir, file);
  const segments = rel.split(sep);
  return segments.length > 1 ? slugifyBank(segments[0]) || DEFAULT_BANK_ID : DEFAULT_BANK_ID;
}

export function buildBanks(
  files: Array<{ path: string; source: string; folderBankId: string }>,
): QuestionBank[] {
  const seenQuestionIds = new Set<string>();
  const seenPassageIds = new Set<string>();
  const banks = new Map<string, QuestionBank>();
  const names = new Map<string, string>();
  const descriptions = new Map<string, string>();

  const ensureBank = (id: string): QuestionBank => {
    let bank = banks.get(id);
    if (!bank) {
      bank = { id, name: titleizeBank(id), questions: [], passages: [] };
      banks.set(id, bank);
    }
    return bank;
  };

  for (const { path, source, folderBankId } of files) {
    const parsed = parseQuestionFile(source, path, folderBankId);

    for (const meta of parsed.bankMeta) {
      if (meta.name) names.set(meta.id, meta.name);
      if (meta.description) descriptions.set(meta.id, meta.description);
    }

    for (const passage of parsed.passages) {
      if (seenPassageIds.has(passage.id)) {
        throw new Error(`${path}: duplicate passage id ${passage.id}`);
      }
      seenPassageIds.add(passage.id);
      ensureBank(passage.bankId).passages.push({
        id: passage.id,
        title: passage.title,
        body: passage.body,
      });
    }

    for (const imported of parsed.questions) {
      if (seenQuestionIds.has(imported.id)) {
        throw new Error(`${path}: duplicate id ${imported.id}`);
      }
      seenQuestionIds.add(imported.id);
      ensureBank(imported.bankId).questions.push(questionToRuntime(imported));
    }
  }

  return [...banks.values()]
    .map((bank) => ({
      ...bank,
      name: names.get(bank.id) ?? bank.name,
      description: descriptions.get(bank.id),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function generateSource(banks: QuestionBank[]): string {
  return `// AUTO-GENERATED by scripts/import-questions.ts — do not edit by hand.
// Run \`npm run questions:import\` to regenerate from question-bank/ Markdown.
import type { QuestionBank } from "@/lib/types";

export const importedBanks: QuestionBank[] = ${JSON.stringify(banks, null, 2)};
`;
}

export const DEFAULT_INPUT_DIR = "question-bank";
export const DEFAULT_OUTPUT_FILE = "lib/questions/imported.ts";

export type ImportQuestionOptions = {
  assetOutputDir?: string;
  includeCoreDiagrams?: boolean;
};

export function writeQuestionDiagramAssets(
  files: Array<{ path: string; source: string; folderBankId: string }>,
  assetOutputDir = DEFAULT_ASSET_OUTPUT_DIR,
): number {
  let written = 0;
  for (const { path, source, folderBankId } of files) {
    const parsed = parseQuestionFile(source, path, folderBankId);
    for (const question of parsed.questions) {
      if (!question.diagram) continue;
      const assetPath = join(assetOutputDir, question.bankId, `${question.id}.svg`);
      mkdirSync(dirname(assetPath), { recursive: true });
      writeFileSync(
        assetPath,
        renderMathDiagram(question.diagram, {
          filePath: path,
          questionId: question.id,
        }),
      );
      written += 1;
    }
  }
  return written;
}

export function writeCoreMathDiagramAssets(
  assetOutputDir = DEFAULT_ASSET_OUTPUT_DIR,
): number {
  for (const diagram of CORE_MATH_DIAGRAMS) {
    const assetPath = join(assetOutputDir, PRESET_CORE_ASSET_BANK_ID, `${diagram.questionId}.svg`);
    mkdirSync(dirname(assetPath), { recursive: true });
    writeFileSync(
      assetPath,
      renderMathDiagram(diagram.spec, {
        filePath: "lib/questions/math.ts",
        questionId: diagram.questionId,
      }),
    );
  }
  return CORE_MATH_DIAGRAMS.length;
}

const PRESET_CORE_ASSET_BANK_ID = "core";

/** Parse every Markdown file under `inputDir` and (re)write the generated bank source. */
export function importQuestions(
  inputDir = DEFAULT_INPUT_DIR,
  outputFile = DEFAULT_OUTPUT_FILE,
  options: ImportQuestionOptions = {},
): QuestionBank[] {
  const files = walkMarkdown(inputDir).map((path) => ({
    path,
    source: readFileSync(path, "utf8"),
    folderBankId: folderBankIdFor(inputDir, path),
  }));
  const banks = buildBanks(files);
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, generateSource(banks));
  const assetOutputDir = options.assetOutputDir ?? DEFAULT_ASSET_OUTPUT_DIR;
  writeQuestionDiagramAssets(files, assetOutputDir);
  if (options.includeCoreDiagrams ?? true) {
    writeCoreMathDiagramAssets(assetOutputDir);
  }
  return banks;
}

function summarize(banks: QuestionBank[], inputDir: string, outputFile: string) {
  const questionCount = banks.reduce((sum, bank) => sum + bank.questions.length, 0);
  console.log(
    `Imported ${questionCount} question(s) across ${banks.length} bank(s) from ${relative(
      process.cwd(),
      inputDir,
    )} to ${relative(process.cwd(), outputFile)}`,
  );
  for (const bank of banks) {
    const pending = bank.questions.filter((q) => q.reviewStatus !== "approved").length;
    const note = pending ? ` — ${pending} awaiting review` : "";
    console.log(`  • ${bank.id} (${bank.name}): ${bank.questions.length} question(s)${note}`);
  }
}

function main() {
  const inputDir = process.argv[2] ?? DEFAULT_INPUT_DIR;
  const outputFile = process.argv[3] ?? DEFAULT_OUTPUT_FILE;
  const banks = importQuestions(inputDir, outputFile);
  summarize(banks, inputDir, outputFile);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
