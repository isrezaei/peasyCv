import { existsSync } from 'node:fs';

/**
 * Resolve a usable Chrome/Chromium executable. An explicit configured path (env
 * PUPPETEER_EXECUTABLE_PATH) always wins; otherwise common install locations on
 * Windows/Linux/macOS are probed. puppeteer-core does not bundle a browser.
 */
export function resolveChromeExecutable(configuredPath: string): string {
  const candidates = [
    configuredPath,
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA
      ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
      : undefined,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter((path): path is string => Boolean(path));

  for (const path of candidates) {
    if (existsSync(path)) return path;
  }

  throw new Error(
    'No Chrome/Chromium executable found for PDF generation. Set PUPPETEER_EXECUTABLE_PATH ' +
      'to a Chrome binary.',
  );
}
