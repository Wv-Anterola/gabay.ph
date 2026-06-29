import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { DEFAULT_INPUT_DIR, importQuestions } from "./import-questions";

/**
 * Mark every question in a bank's Markdown files as approved, then regenerate
 * the bank source so the questions become servable.
 *
 *   npx tsx scripts/approve-questions.ts <bank>
 *   # e.g. npm run questions:approve upcat-mock-a
 */

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Set `review_status: approved` in a single frontmatter-led block. */
function approveBlock(block: string): string {
  const fm = block.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return block;
  const body = fm[1];
  const nextBody = /^\s*review_status\s*:/m.test(body)
    ? body.replace(/^\s*review_status\s*:.*$/m, "review_status: approved")
    : `${body}\nreview_status: approved`;
  return block.replace(/^---\n[\s\S]*?\n---/, `---\n${nextBody}\n---`);
}

/** Approve every `===`-separated block in a file. Exported for tests. */
export function approveFileContent(content: string): string {
  return (
    content
      .split(/^===\s*$/m)
      .map((block) => approveBlock(block.trim()))
      .join("\n\n===\n\n") + "\n"
  );
}

function walkMarkdown(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(path);
    return entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md"
      ? [path]
      : [];
  });
}

function main() {
  const bankArg = process.argv[2];
  if (!bankArg) {
    console.error("Usage: questions:approve <bank>");
    process.exit(1);
  }
  const bankId = slugify(bankArg);
  const bankDir = join(DEFAULT_INPUT_DIR, bankId);
  if (!existsSync(bankDir) || !statSync(bankDir).isDirectory()) {
    console.error(`Bank folder not found: ${bankDir}`);
    process.exit(1);
  }

  const files = walkMarkdown(bankDir);
  let changed = 0;
  for (const file of files) {
    const before = readFileSync(file, "utf8");
    const after = approveFileContent(before);
    if (after !== before) {
      writeFileSync(file, after);
      changed += 1;
    }
  }

  const banks = importQuestions();
  const bank = banks.find((b) => b.id === bankId);
  console.log(`Approved bank "${bankId}" — updated ${changed} file(s).`);
  if (bank) {
    const approved = bank.questions.filter((q) => q.reviewStatus === "approved").length;
    console.log(`Bank "${bankId}" now has ${approved}/${bank.questions.length} approved.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
