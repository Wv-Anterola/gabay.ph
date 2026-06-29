import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  DEFAULT_INPUT_DIR,
  importQuestions,
  parseQuestionFile,
} from "./import-questions";

/**
 * Drop a Markdown blob (one or more `===`-separated questions, or one passage
 * set) straight into a bank folder, validate it, then regenerate the bank
 * source. Paste once instead of hand-creating files.
 *
 *   npx tsx scripts/add-questions.ts <bank> <source.md> [dest-name]
 *   # e.g. npm run questions:add upcat-mock-a ./from-manus.md
 */

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Strip a single wrapping ```md / ``` fence if the whole blob is fenced. */
function stripCodeFence(source: string): string {
  const trimmed = source.trim();
  const match = trimmed.match(/^```(?:md|markdown)?\s*\n([\s\S]*?)\n```$/);
  return match ? match[1].trim() + "\n" : source;
}

function timestampName(): string {
  return `batch-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.md`;
}

function main() {
  const [bankArg, sourceArg, nameArg] = process.argv.slice(2);
  if (!bankArg || !sourceArg) {
    console.error("Usage: questions:add <bank> <source.md> [dest-name]");
    process.exit(1);
  }

  const bankId = slugify(bankArg);
  if (!bankId) {
    console.error(`Invalid bank name: "${bankArg}"`);
    process.exit(1);
  }
  if (!existsSync(sourceArg)) {
    console.error(`Source file not found: ${sourceArg}`);
    process.exit(1);
  }

  const content = stripCodeFence(readFileSync(sourceArg, "utf8"));

  // Validate before touching the bank folder so a bad blob never lands.
  let parsed;
  try {
    parsed = parseQuestionFile(content, sourceArg, bankId);
  } catch (error) {
    console.error(`Validation failed — nothing was added.\n  ${(error as Error).message}`);
    process.exit(1);
  }

  const bankDir = join(DEFAULT_INPUT_DIR, bankId);
  mkdirSync(bankDir, { recursive: true });
  const destName = nameArg
    ? nameArg.endsWith(".md")
      ? nameArg
      : `${nameArg}.md`
    : sourceArg.endsWith(".md")
      ? basename(sourceArg)
      : timestampName();
  const destPath = join(bankDir, destName);
  if (existsSync(destPath)) {
    console.error(`Refusing to overwrite ${destPath}. Pass a different [dest-name].`);
    process.exit(1);
  }
  writeFileSync(destPath, content);

  const banks = importQuestions();
  const bank = banks.find((b) => b.id === bankId);
  console.log(
    `Added ${parsed.questions.length} question(s) to bank "${bankId}" (${destPath}).`,
  );
  if (bank) {
    const pending = bank.questions.filter((q) => q.reviewStatus !== "approved").length;
    console.log(
      `Bank "${bankId}" now has ${bank.questions.length} question(s), ${pending} awaiting review.`,
    );
  }
  console.log(
    "Set `review_status: approved` (per question, or in a set header) and re-run the import to serve them.",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
