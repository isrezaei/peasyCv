import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

const results = [];
const check = (name, cond, extra = "") =>
  results.push(`${cond ? "PASS" : "FAIL"}: ${name}${extra ? " — " + extra : ""}`);

const BASE_URL = process.env.SMOKE_URL ?? "http://localhost:3000";
await page.goto(BASE_URL, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

async function dismissAdModal() {
  if (await page.getByRole("dialog").count()) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
  }
}
async function ensureTemplates() {
  const visible = await page
    .getByRole("button", { name: "دو ستونه", exact: true })
    .isVisible()
    .catch(() => false);
  if (!visible) {
    await page.getByText("قالب‌ها", { exact: true }).first().click();
    await page.waitForTimeout(300);
  }
}
async function switchTo(name) {
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(550);
}

await page.getByPlaceholder("مثال: علی محمدی").fill("سارا احمدی");

// D: summary justified by default.
const summaryJustify = await page.evaluate(() =>
  [...document.querySelectorAll('[contenteditable][role="textbox"]')].some(
    (n) => getComputedStyle(n).textAlign === "justify",
  ),
);
check("About/Summary is justified by default", summaryJustify);

// Inputs: no hover/focus background.
const nameInputBg = await page.evaluate(() => {
  const el = document.querySelector('input[placeholder="مثال: علی محمدی"]');
  el?.focus();
  return el ? getComputedStyle(el).backgroundColor : "missing";
});
check("Focused input has no background fill", nameInputBg === "rgba(0, 0, 0, 0)", `bg=${nameInputBg}`);

// 4: EVERY template uses the solid dots HoverFrame — check on the single-column
// default too. The dots is one button per section ("تنظیمات بخش"); add/delete live
// inside its menu (not mounted until opened).
const dotsCount = await page.getByRole("button", { name: "تنظیمات بخش" }).count();
const deleteBeforeOpen = await page.getByRole("button", { name: "حذف بخش" }).count();
check("Single-column sections show dots HoverFrame", dotsCount > 0, `dots=${dotsCount}`);
check("Delete hidden until the dots menu opens", deleteBeforeOpen === 0);

const dotsSolid = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find(
    (b) => b.getAttribute("aria-label") === "تنظیمات بخش",
  );
  if (!btn) return null;
  const cs = getComputedStyle(btn);
  return { radius: cs.borderTopLeftRadius, bg: cs.backgroundColor };
});
check(
  "Dots button is solid + rounded",
  dotsSolid && parseFloat(dotsSolid.radius) >= 8 && dotsSolid.bg !== "rgba(0, 0, 0, 0)",
  JSON.stringify(dotsSolid),
);

await page.getByRole("button", { name: "تنظیمات بخش" }).first().click();
await page.waitForTimeout(300);
const deleteInMenu = await page.getByRole("button", { name: "حذف بخش" }).count();
const dirInMenu = await page.getByText("جهت متن", { exact: true }).count();
check("Dots menu reveals delete + direction tools", deleteInMenu >= 1 && dirInMenu >= 1, `del=${deleteInMenu} dir=${dirInMenu}`);
await page.keyboard.press("Escape");
await page.waitForTimeout(200);

// 9: Personal Info uses the same dots HoverFrame (its trigger labels the fields).
const personalDots = await page.evaluate(() =>
  [...document.querySelectorAll("button")].some((b) =>
    (b.getAttribute("aria-label") || "").includes("فیلد"),
  ),
);
check("Personal Info has a dots HoverFrame", personalDots === true);

// 3: column-intensity control is wired into the design panel.
await page.getByText("طراحی و فونت", { exact: true }).first().click();
await page.waitForTimeout(300);
const intensityCtl = await page.getByText("شدت رنگ ستون", { exact: true }).count();
check("Column-intensity control present in design panel", intensityCtl >= 1);

// 11: ad modal opens on the 5th template switch (not before).
await ensureTemplates();
const seq = ["دو ستونه", "ستون رنگی کناری", "ستون کناری تیره", "ستون عکس کناری"];
for (const name of seq) {
  await switchTo(name); // switches 1..4 — no modal
}
const beforeFifth = await page.getByRole("dialog").count();
await switchTo("خط زمانی"); // switch 5 — modal
const afterFifth = await page.getByRole("dialog").count();
check("No ad modal before the 5th switch", beforeFifth === 0, `dialogs=${beforeFifth}`);
check("Ad modal opens on the 5th switch", afterFifth >= 1, `dialogs=${afterFifth}`);
const modalAd = await page.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]');
  const slot = dlg?.querySelector('[id^="pos-article-display"]');
  return { found: !!slot, id: slot?.id ?? null };
});
check("Ad modal renders one ad slot", modalAd.found, `id=${modalAd.id}`);
await page.screenshot({ path: "scripts/te-1-ad-modal.png" });
await dismissAdModal();

// 2: timeline — «درباره من» is in the MAIN timeline column, NOT the tinted side
// panel. In RTL the main column is on the right and the panel (which holds the
// skills section) on the left, so About must sit to the right of «مهارت‌ها».
const aboutInMain = await page.evaluate(() => {
  const find = (txt) =>
    [...document.querySelectorAll("h2")].find((n) => n.textContent?.includes(txt));
  const about = find("درباره من");
  const skills = find("مهارت‌ها");
  if (!about || !skills) return { found: false };
  const aboutX = about.getBoundingClientRect().left;
  const skillsX = skills.getBoundingClientRect().left;
  return { found: true, inMain: aboutX > skillsX, aboutX: Math.round(aboutX), skillsX: Math.round(skillsX) };
});
check("Timeline: About is in the main column (not the panel)", aboutInMain.found && aboutInMain.inMain, JSON.stringify(aboutInMain));
await page.screenshot({ path: "scripts/te-3-timeline.png", fullPage: true });

// 7/E: centered template full-width, lighter rule.
await ensureTemplates();
await switchTo("کلاسیک وسط‌چین");
await dismissAdModal();
const ruleFull = await page.evaluate(() => {
  for (const h of document.querySelectorAll("h2")) {
    const stack = h.closest("div")?.parentElement;
    if (!stack) continue;
    const rule = [...stack.children].find(
      (c) => c !== h.closest("div") && c.offsetHeight > 0 && c.offsetHeight <= 3,
    );
    if (rule) {
      const ratio = rule.getBoundingClientRect().width / stack.getBoundingClientRect().width;
      if (ratio > 0.9) return { ok: true, ratio: ratio.toFixed(2), opacity: getComputedStyle(rule).opacity };
    }
  }
  return { ok: false };
});
check("Centered rule spans full width", ruleFull.ok, `ratio=${ruleFull.ratio ?? "n/a"}`);
check("Centered rule is light", ruleFull.ok && parseFloat(ruleFull.opacity) <= 0.2, `opacity=${ruleFull.opacity}`);
await page.screenshot({ path: "scripts/te-2-centered.png", fullPage: true });

console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL"));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
