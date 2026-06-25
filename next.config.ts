import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Disable the Next dev-tools "Segment Explorer" overlay. In Next 15.5.x it
    // intermittently throws a React Client Manifest error in dev
    // ("…segment-explorer-node.js#SegmentViewNode"). It is a dev-only devtools
    // feature with no effect on the app or production build.
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
