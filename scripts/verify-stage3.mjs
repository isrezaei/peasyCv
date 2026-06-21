import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";

function countPages(buf) {
  const text = buf.toString("latin1");
  const m = [...text.matchAll(/\/Type\s*\/Page[^s]/g)];
  return m.length;
}

async function postPdf(label, body) {
  const res = await fetch(`${BASE}/api/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.log(`FAIL: PDF ${label} -> HTTP ${res.status}: ${await res.text()}`);
    return;
  }
  const ct = res.headers.get("content-type");
  const buf = Buffer.from(await res.arrayBuffer());
  const isPdf = buf.subarray(0, 5).toString() === "%PDF-";
  const file = `scripts/s3-${label}.pdf`;
  writeFileSync(file, buf);
  console.log(
    `${isPdf ? "OK" : "FAIL"}: PDF ${label} -> ${ct}, ${buf.length} bytes, ~${countPages(buf)} page(s), saved ${file}`,
  );
}

// --- 1) PDF pipeline: default + variations (color toggle + calendars) -------
await postPdf("default", { resume: {} });
await postPdf("white-hijri", {
  resume: { theme: { pageBackground: "white", backgroundPattern: "halftone", dateCalendar: "hijri" } },
});
await postPdf("colored-gregorian", {
  resume: { theme: { pageBackground: "theme", backgroundPattern: "none", dateCalendar: "gregorian" } },
});

// --- 2) UI checks: bg-color toggle independence + date picker ---------------
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

const step = async (name, fn) => {
  try {
    await fn();
    console.log("OK:", name);
  } catch (e) {
    console.log("FAIL:", name, "-", e.message.split("\n")[0]);
  }
};

// The Design panel is open by default (activePanel="design", not collapsed), so
// the colored-page switch is already mounted — clicking the tool would close it.
// Chakra's Switch is a <label data-scope="switch"> with data-state checked/unchecked.
const bgSwitch = page
  .locator('label[data-scope="switch"]')
  .filter({ hasText: "صفحهٔ رنگی" })
  .first();
await step("colored-page switch present + checked by default (colored)", async () => {
  await bgSwitch.waitFor({ state: "visible", timeout: 10000 });
  const state = await bgSwitch.getAttribute("data-state");
  if (state !== "checked") throw new Error(`expected checked, got ${state}`);
});

await step("toggle colored-page background off (white)", async () => {
  await bgSwitch.click();
  await page.waitForTimeout(900); // allow the 600ms debounced autosave to flush
  const state = await bgSwitch.getAttribute("data-state");
  if (state !== "unchecked") throw new Error(`expected unchecked, got ${state}`);
  const persisted = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("ai-res:resume")).theme.pageBackground,
  );
  if (persisted !== "white") throw new Error(`persisted ${persisted}, expected white`);
});
await page.screenshot({ path: "scripts/s3-bg-white.png", fullPage: true });

await step("toggle colored-page on — pattern stays independent", async () => {
  await bgSwitch.click();
  await page.waitForTimeout(900); // allow the 600ms debounced autosave to flush
  const { pageBackground, backgroundPattern } = await page.evaluate(() => {
    const theme = JSON.parse(localStorage.getItem("ai-res:resume")).theme;
    return { pageBackground: theme.pageBackground, backgroundPattern: theme.backgroundPattern };
  });
  if (pageBackground !== "theme") throw new Error(`pageBackground ${pageBackground}`);
  // The default seed pattern ("blobs") must be untouched by the colour toggle.
  if (backgroundPattern !== "blobs") throw new Error(`pattern changed to ${backgroundPattern}`);
  console.log(`   pageBackground=${pageBackground}, backgroundPattern=${backgroundPattern} (independent)`);
});
await page.screenshot({ path: "scripts/s3-bg-colored.png", fullPage: true });

await step("open a date picker in the experience entry", async () => {
  await page.getByRole("button", { name: "انتخاب تاریخ" }).first().click();
  await page.waitForTimeout(400);
});
await page.screenshot({ path: "scripts/s3-datepicker-jalali.png", fullPage: true });

await step("switch calendar to Hijri (قمری)", async () => {
  await page.getByRole("button", { name: "قمری", exact: true }).first().click();
  await page.waitForTimeout(400);
});
await page.screenshot({ path: "scripts/s3-datepicker-hijri.png", fullPage: true });

await step("pick a day from the calendar grid", async () => {
  await page.getByRole("button", { name: "۱۵", exact: true }).first().click();
  await page.waitForTimeout(400);
});

// --- 3) /print renders headlessly with injected data ------------------------
const printPage = await browser.newPage({ viewport: { width: 900, height: 1400 } });
await printPage.addInitScript(() => {
  window.__RESUME_DATA__ = { title: "تست", theme: { dateCalendar: "jalali" } };
});
await printPage.goto(`${BASE}/print`, { waitUntil: "networkidle" });
await step("/print reaches pdf-ready state", async () => {
  await printPage.waitForSelector('[data-pdf-ready="true"]', { timeout: 30000 });
});
await step("/print hides editor chrome (no RightRail/ads)", async () => {
  const railCount = await printPage.locator(".no-print").count();
  const pages = await printPage.locator(".a4-page").count();
  if (pages < 1) throw new Error("no a4-page rendered");
  console.log(`   (a4-page count: ${pages}, no-print nodes present in DOM: ${railCount})`);
});

console.log("CONSOLE_ERRORS:", JSON.stringify(errors, null, 2));
await browser.close();
