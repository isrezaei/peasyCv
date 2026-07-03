import { existsSync } from "node:fs";

/**
 * Candidate Chrome/Chromium executables, in priority order. Puppeteer-core does
 * not bundle a browser, so the route locates an installed Chrome. An explicit
 * env var always wins, which is also how a serverless deployment would point at
 * a bundled Chromium (see the PDF route's deployment note).
 */
function candidatePaths(): string[] {
  const localAppData = process.env.LOCALAPPDATA;
  return [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    localAppData ? `${localAppData}\\Google\\Chrome\\Application\\chrome.exe` : undefined,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter((path): path is string => Boolean(path));
}

/** Resolve a usable Chrome executable path or throw an actionable error. */
export function resolveChromeExecutable(): string {
  for (const path of candidatePaths()) {
    if (existsSync(path)) return path;
  }
  throw new Error(
    "No Chrome/Chromium executable found for PDF generation. Set the " +
      "PUPPETEER_EXECUTABLE_PATH environment variable to a Chrome binary.",
  );
}
