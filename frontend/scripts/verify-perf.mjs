import { chromium } from "playwright-core";

// Verifies the three deliverables of the performance pass:
//   1. Debounced/deferred store commits (typing stays local; commit after pause).
//   2. Top-bar save indicator transitions «ذخیره شد» → «در حال ذخیره» → «ذخیره شد».
//   3. Backspace on an empty responsibility line deletes it and moves focus up.

const BASE_URL = process.env.SMOKE_URL ?? "http://localhost:3000";
const NAME_PLACEHOLDER = "مثال: علی محمدی";
const RESP_LABEL = "یک مسئولیت یا دستاورد را بنویسید...";
const ADD_ENTRY = "افزودن مورد";
const EXP_HEADING = "تجربه کاری";
const STORAGE_KEY = "ai-res:resume";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`);
};

await page.goto(BASE_URL, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

const readStatus = () =>
  page.evaluate(() => {
    const text = document.querySelector("header")?.innerText ?? "";
    if (text.includes("در حال ذخیره")) return "saving";
    if (text.includes("ذخیره شد")) return "saved";
    return "none";
  });
const readStoredName = () =>
  page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).personalInfo.fullName : null;
  }, STORAGE_KEY);

// ---- Item 2 (initial) + Item 1 (deferral while focused) -------------------
check("indicator reads «ذخیره شد» after load", (await readStatus()) === "saved");

const nameField = page.getByPlaceholder(NAME_PLACEHOLDER).first();
await nameField.click();
await page.keyboard.type("اول", { delay: 40 });

// Immediately after typing (still focused, inside the debounce window) the value
// must NOT yet be committed/persisted, and the indicator must read "saving".
const storedDuringTyping = await readStoredName();
const statusDuringTyping = await readStatus();
check(
  "store commit is deferred while typing (not per-keystroke)",
  storedDuringTyping !== "اول",
  `persisted=${JSON.stringify(storedDuringTyping)}`,
);
check("indicator switches to «در حال ذخیره» on edit", statusDuringTyping === "saving");

// The visible input stays responsive (driven by local state).
check("input stays responsive while typing", (await nameField.inputValue()) === "اول");

// After the pause, the deferred value commits and persists exactly once.
await page.waitForTimeout(1600);
check("deferred value persists after pause", (await readStoredName()) === "اول");
check("indicator settles back to «ذخیره شد»", (await readStatus()) === "saved");

// ---- Item 1 (flush on blur, nothing lost) ---------------------------------
await nameField.click();
await page.keyboard.press("End");
await page.keyboard.type(" دوم", { delay: 40 });
await page.keyboard.press("Tab"); // blur → flush
await page.waitForTimeout(900);
check("blur flushes the pending edit", (await readStoredName()) === "اول دوم");

// ---- Item 3 (Backspace deletes empty responsibility line) -----------------
const resp = page.locator(`[role="textbox"][aria-label="${RESP_LABEL}"]`);
await page.getByRole("heading", { name: EXP_HEADING }).first().hover();
await page.getByRole("button", { name: ADD_ENTRY }).first().click();
await page.waitForTimeout(400);

const beforeCount = await resp.count();
// A fresh experience entry starts with two empty bullet lines.
check("new entry seeds responsibility lines", beforeCount >= 2, `count=${beforeCount}`);

await resp.last().click(); // focus the last (empty) bullet
await page.keyboard.press("Backspace");
await page.waitForTimeout(300);

const afterCount = await resp.count();
check("Backspace on empty line removes the bullet", afterCount === beforeCount - 1, `${beforeCount}→${afterCount}`);

const focusedLabel = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
check("focus moves up to the previous responsibility line", focusedLabel === RESP_LABEL);

// Guard: deleting never drops below the one-line minimum for an entry.
const probe = resp.last();
await probe.click();
const minBefore = await resp.count();
await page.keyboard.press("Backspace");
await page.waitForTimeout(250);
const minAfter = await resp.count();
check("does not delete below the minimum", minAfter >= 1 && minBefore - minAfter <= 1, `${minBefore}→${minAfter}`);

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
process.exit(failed.length === 0 ? 0 : 1);
