// Confirms the /print render (the PDF source) still captures prose content now
// that rich-text fields inject their HTML via an effect, and that the inline
// formatting survives into the print surface and a real PDF.
// Run: SMOKE_URL=http://localhost:3100 node scripts/verify-print-s3.mjs
import { chromium } from "playwright-core";
import { createPdfClient } from "./backend-api.mjs";

const BASE_URL = process.env.SMOKE_URL ?? "http://localhost:3000";
const STORAGE_KEY = "ai-res:resume";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

let failures = 0;
async function check(name, fn) {
  try {
    await fn();
    console.log("PASS:", name);
  } catch (err) {
    failures += 1;
    console.log("FAIL:", name, "-", err.message.split("\n")[0]);
  }
}
const assert = (c, m) => {
  if (!c) throw new Error(m);
};

async function dblclickWord(field) {
  const box = await field.boundingBox();
  await field.dblclick({ position: { x: Math.max(8, box.width - 28), y: Math.min(12, box.height / 2) } });
}

// 1) Produce real formatted content through the editor.
await page.goto(BASE_URL, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

const summary = page.locator('[contenteditable="true"][aria-label*="خلاصهٔ کوتاه"]');
await summary.click();
await page.keyboard.type("خلاصهٔ آزمایشی برای پی‌دی‌اف");
await dblclickWord(summary);
await page.waitForSelector("[data-formatting-popover]", { state: "visible", timeout: 3000 });
await page.getByRole("button", { name: "درشت" }).click();
await page.waitForTimeout(900);

const resume = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
assert(resume?.summary.html.includes("<strong>"), "setup: summary not formatted");

// 2) Render /print with that resume injected, exactly like the PDF route does.
await page.addInitScript((data) => {
  window.__RESUME_DATA__ = data;
}, resume);

await check("/print renders formatted prose and signals ready", async () => {
  await page.goto(`${BASE_URL}/print`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-pdf-ready="true"]', { timeout: 20000 });
  const strongText = await page.locator("strong").first().innerText();
  assert(strongText.trim().length > 0, "no <strong> text rendered in print");
  const body = await page.locator("body").innerText();
  assert(body.includes("آزمایشی"), "summary prose missing from print surface");
});

// 3) Generate a real PDF end-to-end via the authenticated backend /pdf
// endpoint (the unauthenticated Next /api/pdf route was removed). The resume
// read from the guest localStorage key is full store-shaped ResumeData — the
// same payload the authenticated autosave PUTs — so it satisfies the DTO.
await check("backend /pdf returns a non-trivial PDF", async () => {
  const pdfClient = await createPdfClient();
  const buf = await pdfClient.renderPdf(resume);
  assert(buf.length > 5000, `pdf too small (${buf.length} bytes)`);
  assert(buf.slice(0, 5).toString() === "%PDF-", "response is not a PDF");
});

console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors, null, 2));
console.log(failures === 0 ? "ALL CHECKS PASSED" : `FAILURES: ${failures}`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
