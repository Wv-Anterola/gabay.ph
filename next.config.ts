import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prisma Compute builds the deployable artifact on the local machine. Since
  // we build on Windows but the app runs on a Linux container, force a
  // platform-independent SWC binding (wasm) into the standalone bundle so
  // `next start` can load SWC at runtime. `scripts/copy-swc.mjs` (run after
  // `next build`) is the belt-and-suspenders guarantee alongside this trace.
  output: "standalone",
  outputFileTracingIncludes: {
    "*": ["./node_modules/@next/swc-wasm-nodejs/**/*"],
  },
  experimental: {
    // Disable the Next dev-tools "Segment Explorer" overlay. In Next 15.5.x it
    // intermittently throws a React Client Manifest error in dev
    // ("…segment-explorer-node.js#SegmentViewNode"). It is a dev-only devtools
    // feature with no effect on the app or production build.
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
