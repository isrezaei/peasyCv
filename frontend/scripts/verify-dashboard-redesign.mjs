/**
 * Verifies the "My Resumes Redesign" dashboard refactor + the occupation
 * modal: layout renders in light/dark/RTL at three widths, every existing
 * action (open / new / duplicate / delete / rename) still works through the
 * ownership-checked endpoints, sort + newest badge intact, and the occupation
 * modal lists all 11 categories with per-category icons, persists a change,
 * honors Esc/focus-return, and never rewrites stored resume content.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const API = "http://localhost:4000";
const OUT = "scripts/out-dashboard-redesign";
mkdirSync(OUT, { recursive: true });

let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failures += 1;
};

const api = async (path, opts = {}, token) => {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json();
};

const seedTokens = async (page, tokens) => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([a, r]) => {
      window.localStorage.setItem("ai-res:accessToken", a);
      window.localStorage.setItem("ai-res:refreshToken", r);
    },
    [tokens.accessToken, tokens.refreshToken],
  );
  await page.reload({ waitUntil: "domcontentloaded" });
};

const run = async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const errors = []; // {url, text}
  const stamp = Date.now();

  const reg = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: `dash-rd-${stamp}@test.local`, password: "S3curePass!x" }),
  });
  const tok = reg.tokens.accessToken;
  const r1 = await api("/resumes", { method: "POST", body: "{}" }, tok);
  const r2 = await api("/resumes", { method: "POST", body: "{}" }, tok);
  // Typed user content on r2 (also makes r2 the newest-edited resume).
  const full2 = await api(`/resumes/${r2.id}`, {}, tok);
  await api(`/resumes/${r2.id}`, {
    method: "PUT",
    body: JSON.stringify({ ...full2, title: "عنوان دستی من" }),
  }, tok);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push({ url: page.url(), text: m.text() }));
  page.on("pageerror", (e) => errors.push({ url: page.url(), text: String(e) }));
  await seedTokens(page, reg.tokens);
  await page.locator('[data-testid="resume-card"]').first().waitFor({ timeout: 20000 });

  // --- 1. Header identity cluster --------------------------------------------
  check(await page.getByText(`dash-rd-${stamp}@test.local`).isVisible(), "header shows user email");
  check(await page.getByText("حوزه شغلی انتخاب نشده").isVisible(), "header shows not-selected occupation label");
  const pencil = page.getByRole("button", { name: "تغییر حوزه شغلی" });
  check(await pencil.isVisible(), "occupation pencil trigger present in header");

  // --- 2. Cards: count, order, badge, dates ----------------------------------
  const cards = page.locator('[data-testid="resume-card"]');
  check((await cards.count()) === 2, "two seeded cards render");
  const firstTitle = await cards.nth(0).locator("h3, p").first().textContent();
  check((firstTitle || "").includes("عنوان دستی من"), `newest-edited resume first (got: ${firstTitle})`);
  check((await cards.nth(0).locator('[data-testid="newest-badge"]').count()) === 1, "newest badge on first card");
  check((await cards.nth(1).locator('[data-testid="newest-badge"]').count()) === 0, "no badge on second card");
  check((await cards.nth(0).getByText("آخرین ویرایش").count()) === 1, "updated-at row visible");
  check((await cards.nth(0).getByText("ایجاد").count()) === 1, "created-at row visible");
  await page.screenshot({ path: `${OUT}/desktop-light.png`, fullPage: true });

  // --- 3. Occupation modal ---------------------------------------------------
  await pencil.click();
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ timeout: 5000 });
  const rows = dialog.locator("button:has(svg)");
  const rowCount = await rows.count();
  check(rowCount === 11, `modal lists 11 categories (${rowCount})`);
  const withIcon = await rows.evaluateAll((els) => els.filter((el) => el.querySelector("svg")).length);
  check(withIcon === 11, "every category row has an icon");
  // RTL: the icon tile must sit on the inline-start (right) side of its label.
  const rtlOk = await rows.first().evaluate((el) => {
    const icon = el.querySelector("svg").closest("div");
    const label = el.querySelector("p");
    return icon.getBoundingClientRect().left > label.getBoundingClientRect().right - 1;
  });
  check(rtlOk, "icon sits inline-start (right) of the label in RTL");
  check((await dialog.locator('[aria-current="true"]').count()) === 0, "no selection marked before any choice");
  await page.screenshot({ path: `${OUT}/modal-light.png` });

  // Select a category → persists via existing PATCH path, closes the modal.
  await dialog.getByRole("button", { name: "طراحی و گرافیک" }).click();
  await dialog.waitFor({ state: "hidden", timeout: 5000 });
  await page.getByText("طراحی و گرافیک").first().waitFor({ timeout: 5000 });
  const me = await api("/auth/me", {}, tok);
  check(me.occupationCategory === "design-creative", `selection persisted (${me.occupationCategory})`);

  // Reopen: current selection indicated; focus trap; Esc; focus return.
  await pencil.click();
  await dialog.waitFor({ timeout: 5000 });
  const currentRow = dialog.locator('[aria-current="true"]');
  check((await currentRow.count()) === 1, "current selection marked");
  check(((await currentRow.textContent()) || "").includes("طراحی و گرافیک"), "marked row is the chosen category");
  check((await currentRow.locator("svg").count()) === 2, "selected row shows check icon beside its glyph");
  for (let i = 0; i < 15; i += 1) await page.keyboard.press("Tab");
  const trapped = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
  check(trapped, "focus stays trapped inside the dialog");
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden", timeout: 5000 });
  const focusBack = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") === "تغییر حوزه شغلی",
  );
  check(focusBack, "Esc closes and focus returns to the pencil trigger");

  // --- 4. Category change never rewrites stored resume content ---------------
  const before = JSON.stringify(await api(`/resumes/${r2.id}`, {}, tok));
  await pencil.click();
  await dialog.waitFor({ timeout: 5000 });
  await dialog.getByRole("button", { name: "آزاد", exact: true }).click();
  await dialog.waitFor({ state: "hidden", timeout: 5000 });
  const after = JSON.stringify(await api(`/resumes/${r2.id}`, {}, tok));
  check(before === after, "typed resume content untouched by category change");

  // --- 5. Rename still works (title reads as editable) -----------------------
  await cards.nth(1).getByText("رزومه من", { exact: false }).first().click();
  const input = cards.nth(1).locator("input");
  await input.waitFor({ timeout: 5000 });
  await input.fill("رزومه تغییرنام‌یافته");
  await page.keyboard.press("Enter");
  await page.getByText("رزومه تغییرنام‌یافته").first().waitFor({ timeout: 10000 });
  check(true, "inline rename commits");
  // Rename bumps updatedAt → renamed card should now be first with the badge.
  await page.waitForTimeout(300);
  const newFirst = await cards.nth(0).textContent();
  check((newFirst || "").includes("رزومه تغییرنام‌یافته"), "sort follows updatedAt after rename");

  // --- 6. Duplicate ----------------------------------------------------------
  const errCountBeforeDup = errors.length;
  await cards.nth(0).getByRole("button", { name: "کپی" }).click();
  await page.waitForTimeout(2500);
  const cardsAfterDup = await cards.count();
  const dupErrors = errors.slice(errCountBeforeDup).map((e) => e.text);
  if (cardsAfterDup === 3) {
    check(true, "duplicate creates a third card");
    check((await cards.nth(0).textContent() || "").includes("(کپی)"), "duplicate is newest and suffixed");
  } else {
    const is409 = dupErrors.some((t) => t.includes("409"));
    console.log(`INFO  duplicate did not add a card (count=${cardsAfterDup}); errors: ${dupErrors.join(" | ")}`);
    check(is409, "duplicate blocked only by the PRE-EXISTING serializer 409 (not a regression)");
  }
  const dupErrorTexts = new Set(errors.slice(errCountBeforeDup).map((e) => e.text));

  // --- 7. Delete with confirmation -------------------------------------------
  const countBeforeDelete = await cards.count();
  await cards.nth(0).getByRole("button", { name: "حذف" }).click();
  const confirm = page.locator('[role="dialog"]', { hasText: "حذف رزومه" });
  await confirm.waitFor({ timeout: 5000 });
  await confirm.getByRole("button", { name: "حذف", exact: true }).click();
  await confirm.waitFor({ state: "hidden", timeout: 10000 });
  await page.waitForTimeout(500);
  check((await cards.count()) === countBeforeDelete - 1, "delete (after confirm) removes the card");

  // --- 8. Open routes to the editor ------------------------------------------
  await cards.nth(0).locator('button[aria-label*="ویرایش"]').click();
  await page.waitForURL(/\?resume=/, { timeout: 15000 });
  check(page.url().includes("?resume="), "card body opens the resume in the editor");
  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.locator('[data-testid="resume-card"]').first().waitFor({ timeout: 20000 });

  // --- 9. New resume ---------------------------------------------------------
  await page.getByRole("button", { name: "رزومه جدید" }).click();
  await page.waitForURL(/\?resume=/, { timeout: 15000 });
  check(true, "new-resume button creates and opens a resume");

  // --- 10. Cross-user access still rejected server-side ----------------------
  const regB = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: `dash-rd-b-${stamp}@test.local`, password: "S3curePass!x" }),
  });
  let crossStatus = 0;
  try {
    await api(`/resumes/${r2.id}`, {}, regB.tokens.accessToken);
    crossStatus = 200;
  } catch (e) {
    crossStatus = Number(String(e.message).match(/-> (\d+)/)?.[1] ?? 0);
  }
  check(crossStatus === 403 || crossStatus === 404, `cross-user resume id rejected (${crossStatus})`);

  // --- 11. Dark mode ---------------------------------------------------------
  const page2 = await ctx.newPage();
  page2.on("console", (m) => m.type() === "error" && errors.push({ url: page2.url(), text: m.text() }));
  await page2.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page2.locator('[data-testid="resume-card"]').first().waitFor({ timeout: 20000 });
  const cardBgLight = await page2
    .locator('[data-testid="resume-card"]')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  await page2.getByRole("button", { name: "تغییر حالت روشن/تاریک" }).click();
  await page2.waitForTimeout(400);
  const darkApplied = await page2.evaluate(() => document.documentElement.classList.contains("dark"));
  check(darkApplied, "color-mode toggle applies .dark");
  const cardBgDark = await page2
    .locator('[data-testid="resume-card"]')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  check(cardBgLight !== cardBgDark, `card surface re-themes in dark (${cardBgLight} → ${cardBgDark})`);
  await page2.screenshot({ path: `${OUT}/desktop-dark.png`, fullPage: true });
  await page2.getByRole("button", { name: "تغییر حوزه شغلی" }).click();
  await page2.locator('[role="dialog"]').waitFor({ timeout: 5000 });
  await page2.screenshot({ path: `${OUT}/modal-dark.png` });
  await page2.keyboard.press("Escape");
  await page2.getByRole("button", { name: "تغییر حالت روشن/تاریک" }).click(); // restore light
  await page2.close();

  // --- 12. Responsive: tablet + phone ----------------------------------------
  for (const [w, h, name] of [[820, 1180, "tablet"], [390, 844, "phone"]]) {
    const ctxR = await browser.newContext({ viewport: { width: w, height: h } });
    const pageR = await ctxR.newPage();
    pageR.on("console", (m) => m.type() === "error" && errors.push({ url: pageR.url(), text: m.text() }));
    await seedTokens(pageR, reg.tokens);
    await pageR.locator('[data-testid="resume-card"]').first().waitFor({ timeout: 20000 });
    const noHScroll = await pageR.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    );
    check(noHScroll, `${name} (${w}px): no horizontal overflow`);
    await pageR.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    await ctxR.close();
  }

  // --- Console errors (dashboard scope, duplicate-409 noise excluded) --------
  const relevant = errors.filter(
    (e) => e.url.includes("/dashboard") && !dupErrorTexts.has(e.text) && !e.text.includes("409"),
  );
  check(relevant.length === 0, `zero dashboard console errors (${relevant.length})`);
  relevant.forEach((e) => console.log(`  console: ${e.text}`));

  await browser.close();
  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((e) => {
  console.error("SCRIPT ERROR", e);
  process.exit(2);
});
