import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

// Start clean so the migration path and defaults are exercised.
const BASE_URL = process.env.SMOKE_URL ?? "http://localhost:3000";
await page.goto(BASE_URL, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

const dir = await page.evaluate(() => document.documentElement.getAttribute("dir"));
const lang = await page.evaluate(() => document.documentElement.getAttribute("lang"));
console.log("dir:", dir, "lang:", lang);

async function step(name, fn) {
  try {
    await fn();
    console.log("OK:", name);
  } catch (err) {
    console.log("FAIL:", name, "-", err.message.split("\n")[0]);
  }
}

// The advertisement modal opens on every 2nd template switch; close it (Escape)
// so it doesn't trap focus and block the steps/screenshots that follow.
async function dismissAdModal() {
  if (await page.getByRole("dialog").count()) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
  }
}

await step("fill full name", async () => {
  await page.getByPlaceholder("علی محمدی").fill("سارا احمدی");
});

await step("add experience via section dots menu", async () => {
  const heading = page.getByRole("heading", { name: "تجربه کاری" }).first();
  await heading.hover();
  // The section tools now live in the solid dots HoverFrame — open the experience
  // section's dots (the first one after its heading), then add an entry.
  await page
    .locator('xpath=//h2[contains(., "تجربه کاری")]/following::button[@aria-label="تنظیمات بخش"][1]')
    .click();
  await page.getByRole("button", { name: "افزودن مورد" }).first().click();
  await page.keyboard.press("Escape");
});

await step("fill job title (overlap fix check)", async () => {
  await page.getByPlaceholder("مثال: مهندس نرم‌افزار").first().fill("مهندس فرانت‌اند");
});

await page.waitForTimeout(400);
await page.screenshot({ path: "scripts/v2-1-single-column.png", fullPage: true });

await step("open Templates panel", async () => {
  await page.getByText("قالب‌ها", { exact: true }).first().click();
});
await page.waitForTimeout(400);

await step("switch to double column", async () => {
  // exact: several template names share the «دو ستونه» / «ستون» / «تک‌ستونه» stems.
  await page.getByRole("button", { name: "دو ستونه", exact: true }).click();
});
await page.waitForTimeout(600);
await dismissAdModal();
await page.screenshot({ path: "scripts/v2-2-double-column.png", fullPage: true });

await step("switch to sidebar column", async () => {
  await page.getByRole("button", { name: "ستون رنگی کناری", exact: true }).click();
});
await page.waitForTimeout(600);
// 2nd switch → ad modal opens; close it before continuing.
await dismissAdModal();
await page.screenshot({ path: "scripts/v2-3-sidebar-column.png", fullPage: true });

await step("open Design panel", async () => {
  await page.getByText("طراحی و فونت", { exact: true }).first().click();
});
await page.waitForTimeout(400);

await step("pick a different theme color", async () => {
  await page.getByRole("button", { name: "آبی آسمانی" }).click();
});
await page.waitForTimeout(300);

await step("pick a background pattern", async () => {
  // Background names are English popovers/aria-labels now (no caption captions).
  await page.getByRole("button", { name: "Soft Blobs" }).click();
});
await page.waitForTimeout(300);

await step("back to single column", async () => {
  await page.getByText("قالب‌ها", { exact: true }).first().click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "تک‌ستونه حرفه‌ای", exact: true }).click();
});
await page.waitForTimeout(600);
await dismissAdModal();
await page.screenshot({ path: "scripts/v2-4-themed-single.png", fullPage: true });

// Verify autosave persisted the name.
const savedName = await page.evaluate(() => {
  const raw = localStorage.getItem("ai-res:resume");
  return raw ? JSON.parse(raw).personalInfo.fullName : null;
});
console.log("persisted name:", savedName);

console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors, null, 2));
await browser.close();
