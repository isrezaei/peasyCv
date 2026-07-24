import { chromium } from "playwright-core";

// Verifies the Notion-style responsibility list editor:
//   1. Backspace deletes ANY empty item (first / middle / last), shifts the rest
//      up, and moves focus to the previous item (or the new first item).
//   2. Enter inserts a new empty item after the current one and focuses it.
//   3. No separate "add item" button remains; the list keeps a one-item minimum.

const BASE_URL = process.env.SMOKE_URL ?? "http://localhost:3000";
const NAME = "علی محمدی";
const RESP = "یک مسئولیت یا دستاورد را بنویسید...";
const ADD_ENTRY = "افزودن مورد";
const EXP_HEADING = "تجربه کاری";
const SEL = `[role="textbox"][aria-label="${RESP}"]`;

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`);
};
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

await page.goto(BASE_URL, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

// The default entry's bullets carry seed text and are never touched; the entry we
// add is appended last, so its bullets are the trailing textboxes after `base`.
const base = await page.locator(SEL).count();

// Live text of just the new entry's bullets (DOM reflects local edits instantly).
const newTexts = () =>
  page.evaluate(
    ({ sel, b }) => [...document.querySelectorAll(sel)].slice(b).map((el) => el.textContent ?? ""),
    { sel: SEL, b: base },
  );
const active = () =>
  page.evaluate(() => ({
    label: document.activeElement?.getAttribute("aria-label") ?? null,
    text: document.activeElement?.textContent ?? "",
  }));
const focusNew = (i) => page.locator(SEL).nth(base + i).click();
const type = (s) => page.keyboard.type(s, { delay: 25 });

// Add a fresh experience entry → seeds two empty bullet lines.
await page.getByRole("heading", { name: EXP_HEADING }).first().hover();
await page.getByRole("button", { name: ADD_ENTRY }).first().click();
await page.waitForTimeout(400);
check("new entry seeds two empty bullets", eq(await newTexts(), ["", ""]));

// --- Item 2: Enter inserts a new item after the current and focuses it -------
await focusNew(0);
await type("A");
await page.keyboard.press("Enter");
await page.waitForTimeout(150);
let a = await active();
check("Enter focuses a new empty bullet", a.label === RESP && a.text === "");
await type("B");
// Inserted AFTER "A"; the originally-empty second bullet stays last → order kept.
check("Enter inserts after current, order preserved", eq(await newTexts(), ["A", "B", ""]), JSON.stringify(await newTexts()));

// --- Item 1a: Backspace deletes the LAST empty item, focus to previous end ---
await focusNew(2); // the trailing empty bullet
await page.keyboard.press("Backspace");
await page.waitForTimeout(150);
a = await active();
check("Backspace removes last empty bullet", eq(await newTexts(), ["A", "B"]));
check("focus moves to previous bullet end", a.text === "B");

// --- Item 1b: Backspace deletes the FIRST empty item, focus to new first -----
await focusNew(0); // "A"
await page.keyboard.press("Backspace"); // clears the single char → empty
await page.keyboard.press("Backspace"); // empty → removes the item
await page.waitForTimeout(150);
a = await active();
check("Backspace removes first empty bullet", eq(await newTexts(), ["B"]));
check("focus moves to the new first bullet", a.text === "B");

// --- Item 1c: Backspace deletes a MIDDLE empty item -------------------------
await focusNew(0); // "B"
await page.keyboard.press("Enter"); // → ["B", ""]
await page.waitForTimeout(120);
await type("Z"); // → ["B", "Z"]
await focusNew(0); // "B"
await page.keyboard.press("Enter"); // insert after B → ["B", "", "Z"], focus middle empty
await page.waitForTimeout(150);
check("middle empty bullet created", eq(await newTexts(), ["B", "", "Z"]), JSON.stringify(await newTexts()));
await page.keyboard.press("Backspace"); // delete the middle empty item
await page.waitForTimeout(150);
a = await active();
check("Backspace removes middle empty bullet", eq(await newTexts(), ["B", "Z"]));
check("focus moves to previous bullet (middle case)", a.text === "B");

// --- Item 3a: one-item minimum is never deleted ----------------------------
await focusNew(1); // "Z"
await page.keyboard.press("Backspace"); // clears char → empty
await page.keyboard.press("Backspace"); // removes the now-empty item → ["B"]
await page.waitForTimeout(150);
await focusNew(0); // "B"
await page.keyboard.press("Backspace"); // clears char → empty (only item left)
await page.keyboard.press("Backspace"); // empty + at minimum → no-op
await page.waitForTimeout(150);
check("does not delete the final remaining item", eq(await newTexts(), [""]), JSON.stringify(await newTexts()));

// --- Item 3b: no separate add-item button inside the list ------------------
const listHasButton = await page.evaluate((sel) => {
  const box = document.querySelector(sel);
  const list = box?.parentElement?.parentElement; // textbox → row(HStack) → list(VStack)
  return list ? list.querySelector("button") !== null : null;
}, SEL);
check("no add-item button remains in the responsibility list", listHasButton === false);

// --- Data validity: persisted items keep stable ids + order ----------------
await page.waitForTimeout(1200);
const persisted = await page.evaluate(() => {
  const raw = localStorage.getItem("ai-res:resume");
  if (!raw) return null;
  const exp = JSON.parse(raw).experience;
  const last = exp[exp.length - 1].responsibilities;
  return { count: last.length, allHaveIds: last.every((r) => typeof r.id === "string" && r.id) };
});
check("persisted list stays valid (ids present)", persisted?.allHaveIds === true && persisted?.count === 1, JSON.stringify(persisted));

console.log("CONSOLE_ERRORS:", JSON.stringify(errors));
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed`);
await browser.close();
process.exit(passed === results.length ? 0 : 1);
