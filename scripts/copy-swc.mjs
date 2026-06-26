// Ensure a Linux-compatible Next.js SWC binding ships in the standalone bundle.
//
// Prisma Compute builds the deployable artifact on the local (Windows) machine,
// so the platform-native SWC binary baked into `.next/standalone` cannot load on
// the Linux container — `next start` then crashes with "Failed to load SWC
// binary for linux/x64" and the container reboot-loops (HTTP 502).
//
// We copy the universal wasm binding (and any Linux native bindings that happen
// to be installed) from node_modules into the standalone bundle so the runtime
// SWC loader finds a usable binding regardless of build platform.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.log("[copy-swc] no .next/standalone output; skipping");
  process.exit(0);
}

const srcBase = join(root, "node_modules", "@next");
const destBase = join(standalone, "node_modules", "@next");
const candidates = ["swc-wasm-nodejs", "swc-linux-x64-gnu", "swc-linux-x64-musl"];

let copied = 0;
for (const pkg of candidates) {
  const from = join(srcBase, pkg);
  if (!existsSync(from)) continue;
  mkdirSync(destBase, { recursive: true });
  cpSync(from, join(destBase, pkg), { recursive: true });
  console.log(`[copy-swc] copied @next/${pkg} into the standalone bundle`);
  copied += 1;
}

if (copied === 0) {
  console.warn("[copy-swc] WARNING: no SWC bindings found to copy into the bundle");
} else {
  console.log(`[copy-swc] done (${copied} binding(s))`);
}
