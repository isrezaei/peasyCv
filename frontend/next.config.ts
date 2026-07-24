import type { NextConfig } from "next";
import { join } from "node:path";

// In the monorepo, dependencies (incl. `next`) are hoisted to the repo-root
// node_modules, so Turbopack's root must be the repo root (one level up from
// this frontend workspace) for them to resolve and compile.
const monorepoRoot = join(__dirname, "..");

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  allowedDevOrigins: ['192.168.1.9'],
  // puppeteer-core must stay external (it has dynamic requires + a Node-only
  // runtime) so the PDF route can load it at request time rather than bundling.
  serverExternalPackages: ['puppeteer-core'],
  // Defaults to ".next"; an alternate dir can be supplied (e.g. to build while a
  // dev server holds the default one open on Windows) without affecting normal runs.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // The studio is an application, not indexable content: send X-Robots-Tag on
  // every response so crawlers skip it at the host level (belt-and-braces with
  // the `robots` metadata in app/layout.tsx). The public marketing site lives on
  // a separate host (peasycv.ir) and is the surface meant to rank.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
