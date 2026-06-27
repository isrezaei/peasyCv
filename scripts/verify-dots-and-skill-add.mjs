import { chromium } from "playwright-core";

// Verifies the dots-icon + skill-add edit pass:
//  1. The section HoverFrame trigger is JUST the TbDots glyph — no button skin.
//  2. That glyph is painted in the resume accent (the --rz-secondary tier), never
//     a neutral/black, and still opens the section tools popover.
//  4. The skill-add control is an ICON-ONLY icon button (no text label; «افزودن
//     مهارت» stays as its aria-label) that always trails the last skill, and still
//     adds a skill.
const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";
await page.goto(BASE, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

let failed = 0;
function ok(label, cond, extra = "") {
  if (!cond) failed++;
  console.log(`${cond ? "OK" : "FAIL"}: ${label}${extra ? " — " + extra : ""}`);
}

// ---- ITEM 1 & 2: section dots = bare glyph, accent-coloured, opens tools ----
await page.getByRole("heading", { name: "مهارت‌ها" }).first().hover();
await page.waitForTimeout(200);
const dots = page.locator(
  'xpath=//h2[contains(., "مهارت‌ها")]/following::button[@aria-label="تنظیمات بخش"][1]',
);
const dotsInfo = await dots.evaluate((el) => {
  const cs = getComputedStyle(el);
  const probe = document.createElement("span");
  probe.style.color = "var(--rz-secondary)";
  el.appendChild(probe);
  const accent = getComputedStyle(probe).color;
  probe.remove();
  return {
    tag: el.tagName,
    bg: cs.backgroundColor,
    border: cs.borderTopWidth,
    boxShadow: cs.boxShadow,
    color: cs.color,
    accentVar: accent,
    hasSvg: !!el.querySelector("svg"),
  };
});
console.log("DOTS:", JSON.stringify(dotsInfo));
ok("dots trigger is a <button>", dotsInfo.tag === "BUTTON");
ok("dots has NO button background (transparent)", dotsInfo.bg === "rgba(0, 0, 0, 0)");
ok("dots has NO box-shadow / chip", dotsInfo.boxShadow === "none");
ok("dots has NO border ring", dotsInfo.border === "0px");
ok("dots renders the TbDots svg glyph", dotsInfo.hasSvg);
ok(
  "dots colour follows the resume accent var (--rz-secondary)",
  dotsInfo.color === dotsInfo.accentVar,
  `color=${dotsInfo.color} accent=${dotsInfo.accentVar}`,
);
const neutral = ["rgb(0, 0, 0)", "rgb(24, 24, 27)", "rgb(255, 255, 255)", "rgb(39, 39, 42)"];
ok("dots colour is NOT neutral/black/white", !neutral.includes(dotsInfo.color), dotsInfo.color);

await dots.click();
await page.waitForTimeout(300);
ok(
  "dots still opens the section tools popover",
  (await page.getByRole("button", { name: "افزودن مورد" }).count()) > 0,
);
await page.keyboard.press("Escape");
await page.waitForTimeout(200);

// ---- ITEM 4: skill-add = ICON-ONLY icon button, always after the last skill ----
// getByRole resolves the button by its ACCESSIBLE NAME (the aria-label), which an
// icon-only button still carries even with no visible text.
const addBtn = page.getByRole("button", { name: "افزودن مهارت" }).first();
const addInfo = await addBtn.evaluate((el) => ({
  tag: el.tagName,
  visibleText: el.textContent.trim(),
  ariaLabel: el.getAttribute("aria-label"),
  hasSvg: !!el.querySelector("svg"),
  isLastChild: el.parentElement.lastElementChild === el,
}));
console.log("ADD:", JSON.stringify(addInfo));
ok("skill-add is a <button>", addInfo.tag === "BUTTON");
ok("skill-add has the plus icon", addInfo.hasSvg);
ok("skill-add is ICON-ONLY (no visible text)", addInfo.visibleText === "");
ok("skill-add keeps «افزودن مهارت» as its aria-label", addInfo.ariaLabel === "افزودن مهارت");
ok("skill-add is the LAST element after all chips", addInfo.isLastChild);

const before = await page.getByPlaceholder("نام مهارت").count();
await addBtn.click();
await page.waitForTimeout(300);
ok(
  "clicking add inserts a new skill",
  (await page.getByPlaceholder("نام مهارت").count()) === before + 1,
);
ok(
  "skill-add still trails the newly added (last) skill",
  await page
    .getByRole("button", { name: "افزودن مهارت" })
    .first()
    .evaluate((el) => el.parentElement.lastElementChild === el),
);

if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
console.log("CONSOLE_ERRORS:", JSON.stringify(errors));
console.log(failed === 0 ? "ALL CHECKS PASSED" : `${failed} CHECK(S) FAILED`);
await browser.close();
process.exit(failed === 0 ? 0 : 1);
