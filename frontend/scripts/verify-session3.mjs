// Session-3 verification: (8) «درباره من» placeholder, (9) inline formatting
// popover that persists across sections, (10) the خلاصه→درباره من rename.
// Run against a server: `SMOKE_URL=http://localhost:3100 node scripts/verify-session3.mjs`.
import { chromium } from "playwright-core";

const BASE_URL = process.env.SMOKE_URL ?? "http://localhost:3000";
const SUMMARY_GUIDANCE = "مثال: مهندس نرم‌افزار"; // unique substring of the placeholder
const STORAGE_KEY = "ai-res:resume";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Autosave is debounced at 600ms and only writes after an edit, so always give
// it time to flush before reading the persisted payload.
const PERSIST_WAIT = 900;
const readResume = () =>
  page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);

// Double-click near the inline-start (right edge in RTL) so a real word is
// selected — the wide field's centre is often past the end of short text.
async function dblclickWord(field) {
  const box = await field.boundingBox();
  await field.dblclick({ position: { x: Math.max(8, box.width - 28), y: Math.min(12, box.height / 2) } });
}

// Fresh start so defaults + the rename migration are exercised.
await page.goto(BASE_URL, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

// --- Item 10: rename --------------------------------------------------------
await check("section title reads «درباره من» (not «خلاصه»)", async () => {
  await page.getByRole("heading", { name: "درباره من" }).first().waitFor({ timeout: 5000 });
  const oldTitle = await page.getByRole("heading", { name: "خلاصه", exact: true }).count();
  assert(oldTitle === 0, "old «خلاصه» heading still present");
});

// --- Item 8: placeholder ----------------------------------------------------
const summaryField = page.locator(
  `[contenteditable="true"][aria-label*="${SUMMARY_GUIDANCE}"]`,
);

await check("summary ships empty with guidance placeholder", async () => {
  await summaryField.waitFor({ timeout: 5000 });
  const text = (await summaryField.innerText()).trim();
  assert(text === "", `summary field has seeded text: «${text}»`);
  const placeholder = await summaryField.getAttribute("data-placeholder");
  assert(placeholder?.includes(SUMMARY_GUIDANCE), "placeholder guidance missing");
});

await check("placeholder clears when the user types and content persists", async () => {
  await summaryField.click();
  await page.keyboard.type("متن آزمایشی درباره من");
  await page.waitForTimeout(PERSIST_WAIT);
  const saved = await readResume();
  assert(saved?.summary.html.includes("آزمایشی"), "typed summary text not persisted");
});

// --- Item 9: formatting popover in the summary ------------------------------
await check("double-click word shows popover and bold persists in summary", async () => {
  await dblclickWord(summaryField);
  await page.waitForSelector('[data-formatting-popover]', { state: "visible", timeout: 3000 });
  await page.getByRole("button", { name: "درشت" }).click();
  await page.waitForTimeout(PERSIST_WAIT);
  const saved = await readResume();
  assert(saved?.summary.html.includes("<strong>"), `no <strong> persisted: «${saved?.summary.html}»`);
});

// --- Item 9: same mechanism in another section (experience responsibilities) -
await check("formatting popover works + persists in an experience prose field", async () => {
  const responsibility = page
    .locator('[contenteditable="true"][aria-label*="مسئولیت یا دستاورد"]')
    .first();
  await responsibility.waitFor({ timeout: 5000 });
  await dblclickWord(responsibility);
  await page.waitForSelector('[data-formatting-popover]', { state: "visible", timeout: 3000 });
  await page.getByRole("button", { name: "مورب" }).click();
  await page.waitForTimeout(PERSIST_WAIT);
  const saved = await readResume();
  const text = saved?.experience[0].responsibilities[0].text;
  assert(text?.includes("<em>"), `no <em> persisted in responsibility: «${text}»`);
});

await page.screenshot({ path: "scripts/s3-session3-verify.png", fullPage: true });

console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors, null, 2));
console.log(failures === 0 ? "ALL CHECKS PASSED" : `FAILURES: ${failures}`);
await browser.close();
process.exit(failures === 0 && consoleErrors.length === 0 ? 0 : 1);
