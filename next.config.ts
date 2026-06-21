import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['192.168.1.9'],
  // puppeteer-core must stay external (it has dynamic requires + a Node-only
  // runtime) so the PDF route can load it at request time rather than bundling.
  serverExternalPackages: ['puppeteer-core'],
  // Defaults to ".next"; an alternate dir can be supplied (e.g. to build while a
  // dev server holds the default one open on Windows) without affecting normal runs.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
