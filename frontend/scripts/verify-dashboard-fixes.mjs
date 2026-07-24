/**
 * Verifies the seven dashboard fixes: tight uniform stacked-text spacing,
 * stock Button/IconButton controls (no custom borders/shadows), duplicate
 * removed + edit added, neutral grey card-container, 4-up responsive grid,
 * rename via the edit button with auto-numbered defaults (max-suffix+1), and
 * the per-resume occupation label on cards. Plus the untouched behaviours:
 * open / new / delete, sort, newest badge, cross-user rejection.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const API = "http://localhost:4000";
const OUT = "scripts/out-dashboard-fixes";
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
  return res.status === 204 ? null : res.json();
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

const gapBetween = (pageOrCard, topSel, bottomSel) =>
  pageOrCard.evaluate(
    (el, [t, b]) => {
      const scope = el ?? document;
      const top = scope.querySelector(t);
      const bottom = scope.querySelector(b);
      if (!top || !bottom) return null;
      return bottom.getBoundingClientRect().top - top.getBoundingClientRect().bottom;
    },
    [topSel, bottomSel],
  );

const run = async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const errors = [];
  const stamp = Date.now();

  const reg = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: `dash-fx-${stamp}@test.local`, password: "S3curePass!x" }),
  });
  const tok = reg.tokens.accessToken;
  // One pre-existing resume with a manual title (it must never be auto-renumbered).
  const r1 = await api("/resumes", { method: "POST", body: JSON.stringify({ title: "عنوان دستی من" }) }, tok);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push({ url: page.url(), text: m.text() }));
  page.on("pageerror", (e) => errors.push({ url: page.url(), text: String(e) }));
  await seedTokens(page, reg.tokens);
  const cards = page.locator('[data-testid="resume-card"]');
  await cards.first().waitFor({ timeout: 20000 });

  // --- §7 summary payload carries occupationCategory -------------------------
  const list0 = await api("/resumes", {}, tok);
  check("occupationCategory" in list0[0], "GET /resumes rows carry occupationCategory");
  check(list0[0].occupationCategory === null, "category defaults to null when user has none");
  check((await cards.nth(0).getByText("آزاد", { exact: true }).count()) === 1, "card shows «آزاد» fallback, not template name");
  check((await page.getByText("تک‌ستونه حرفه‌ای").count()) === 0, "template name no longer rendered on cards");

  // --- §1 the four stacked-text gaps ------------------------------------------
  const headerGap = await page.evaluate(() => {
    const email = [...document.querySelectorAll("p")].find((p) => p.textContent.includes("@test.local"));
    const next = email?.parentElement?.children[1];
    if (!email || !next) return null;
    return next.getBoundingClientRect().top - email.getBoundingClientRect().bottom;
  });
  const pageTitleGap = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h2")].find((el) => el.textContent.includes("رزومه‌های من"));
    const sub = h?.parentElement?.children[1];
    if (!h || !sub) return null;
    return sub.getBoundingClientRect().top - h.getBoundingClientRect().bottom;
  });
  // Card title is a Text with textStyle="h3" → renders as <p>, first in its Stack.
  const cardTitleGap = await cards.nth(0).evaluateHandle((el) => el).then((h) =>
    page.evaluate((card) => {
      const title = card.querySelector("p");
      const stack = title?.parentElement;
      if (!stack || stack.children.length < 2) return null;
      return (
        stack.children[1].getBoundingClientRect().top - stack.children[0].getBoundingClientRect().bottom
      );
    }, h),
  );
  const dateRowsGap = await cards.nth(0).evaluateHandle((el) => el).then((h) =>
    page.evaluate((card) => {
      const rows = [...card.querySelectorAll("div")].filter((d) =>
        d.textContent.startsWith("آخرین ویرایش"),
      );
      const stack = rows[rows.length - 1];
      if (!stack || stack.parentElement.children.length < 2) return null;
      const [a, b] = stack.parentElement.children;
      return b.getBoundingClientRect().top - a.getBoundingClientRect().bottom;
    }, h),
  );
  console.log(
    `INFO  gaps px — header:${headerGap} pageTitle:${pageTitleGap} cardTitle:${cardTitleGap} dateRows:${dateRowsGap}`,
  );
  const gaps = [headerGap, pageTitleGap, cardTitleGap, dateRowsGap];
  check(gaps.every((g) => g !== null && g >= 0 && g <= 3), "all four stacked gaps ≤ 3px (token 0.5 = 2px)");
  check(Math.max(...gaps) - Math.min(...gaps) <= 1, "gaps uniform (≤1px spread)");

  // --- §2 stock controls: no custom borders/shadows ---------------------------
  const chromeButtons = await page.evaluate(() => {
    const labels = ["بازگشت به ویرایشگر", "تغییر حالت روشن/تاریک"];
    return labels.map((l) => {
      const b = document.querySelector(`button[aria-label="${l}"]`);
      const s = getComputedStyle(b);
      return { label: l, border: s.borderTopWidth, shadow: s.boxShadow, cls: b.className };
    });
  });
  check(
    chromeButtons.every((b) => b.border === "0px" && b.shadow === "none" && b.cls.includes("chakra-button")),
    `toolbar icon buttons are stock ghost IconButtons (no border/shadow): ${JSON.stringify(chromeButtons.map((b) => [b.border, b.shadow]))}`,
  );
  const newBtnIsChakra = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("رزومه جدید"));
    return b?.className.includes("chakra-button");
  });
  check(newBtnIsChakra, "«رزومه جدید» uses the Button recipe");

  // --- §3 card actions: edit + delete, no duplicate ---------------------------
  check((await page.getByRole("button", { name: "کپی" }).count()) === 0, "no duplicate button anywhere");
  check((await cards.nth(0).getByRole("button", { name: "تغییر نام رزومه" }).count()) === 1, "edit button on card");
  check((await cards.nth(0).getByRole("button", { name: "حذف" }).count()) === 1, "delete button on card");

  // --- §4 neutral grey container (light) --------------------------------------
  const containerBg = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="resume-card"]');
    let el = card.parentElement;
    while (el && getComputedStyle(el).backgroundColor === "rgba(0, 0, 0, 0)") el = el.parentElement;
    return getComputedStyle(el).backgroundColor;
  });
  const [lr, lg, lb] = (containerBg.match(/\d+/g) || []).map(Number);
  // Neutral grey = channels within 4 of each other (zinc.100 is 244/244/245),
  // and light (all > 220). A blue/teal tint would show a much wider spread.
  check(Math.max(lr, lg, lb) - Math.min(lr, lg, lb) <= 4 && lr > 220, `container bg is neutral light grey (${containerBg})`);

  // --- §5 grid: 4 columns at desktop ------------------------------------------
  const colCount = async (p) =>
    p.evaluate(() => {
      const grid = document.querySelector('[data-testid="resume-card"]').parentElement;
      return getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    });
  check((await colCount(page)) === 4, "4 columns at 1440px");

  // --- §6 rename via edit button ----------------------------------------------
  await cards.nth(0).getByRole("button", { name: "تغییر نام رزومه" }).click();
  const input = cards.nth(0).locator("input");
  await input.waitFor({ timeout: 5000 });
  const focusState = await page.evaluate(() => {
    const el = document.activeElement;
    return {
      isInput: el?.tagName === "INPUT",
      selected: el?.selectionEnd - el?.selectionStart === el?.value.length && el?.value.length > 0,
    };
  });
  check(focusState.isInput && focusState.selected, "edit click focuses the input with text selected");
  // Esc cancels.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check((await cards.nth(0).locator("input").count()) === 0, "Esc closes the editor");
  check((await cards.nth(0).getByText("عنوان دستی من").count()) === 1, "Esc restores the previous title");
  // Type + Enter commits and persists.
  await cards.nth(0).getByRole("button", { name: "تغییر نام رزومه" }).click();
  await input.waitFor({ timeout: 5000 });
  await input.fill("نام جدید من");
  await page.keyboard.press("Enter");
  await page.getByText("نام جدید من").first().waitFor({ timeout: 10000 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await cards.first().waitFor({ timeout: 20000 });
  check((await page.getByText("نام جدید من").count()) >= 1, "Enter-committed rename persists across reload");
  // Blur commits.
  await cards.nth(0).getByRole("button", { name: "تغییر نام رزومه" }).click();
  await input.waitFor({ timeout: 5000 });
  await input.fill("نام از راه بلر");
  await page.locator("h2").first().click();
  await page.getByText("نام از راه بلر").first().waitFor({ timeout: 10000 });
  check(true, "blur commits the rename");

  // --- §6 auto-numbered defaults: new resumes ---------------------------------
  const newAndBack = async () => {
    await page.getByRole("button", { name: "رزومه جدید" }).click();
    await page.waitForURL(/\?resume=/, { timeout: 20000 });
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
    await cards.first().waitFor({ timeout: 20000 });
  };
  await newAndBack();
  check((await page.getByText("رزومه من - 1", { exact: true }).count()) === 1, "first unnamed resume is «رزومه من - 1»");
  await newAndBack();
  check((await page.getByText("رزومه من - 2", { exact: true }).count()) === 1, "second is «رزومه من - 2»");
  // Delete «رزومه من - 1», create again → max-suffix+1 gives «- 3» (count would collide).
  const card1 = page.locator('[data-testid="resume-card"]', { hasText: "رزومه من - 1" });
  await card1.getByRole("button", { name: "حذف" }).click();
  const confirm = page.locator('[role="dialog"]', { hasText: "حذف رزومه" });
  await confirm.waitFor({ timeout: 5000 });
  await confirm.getByRole("button", { name: "حذف", exact: true }).click();
  await confirm.waitFor({ state: "hidden", timeout: 10000 });
  await page.waitForTimeout(500);
  check((await page.getByText("رزومه من - 1", { exact: true }).count()) === 0, "delete removes «رزومه من - 1»");
  await newAndBack();
  check(
    (await page.getByText("رزومه من - 3", { exact: true }).count()) === 1,
    "after delete-then-create the new resume is «رزومه من - 3» (max-suffix+1, no duplicate number)",
  );
  const titles = await cards.evaluateAll((els) => els.map((el) => el.querySelector("p")?.textContent));
  check(new Set(titles).size === titles.length, `no duplicate titles (${titles.join(" | ")})`);
  // Empty rename falls back to the next auto-numbered default. Capture the card
  // BY INDEX first — once editing starts the title <p> becomes an <input>, so a
  // hasText filter on the old title would stop matching.
  const blurIdx = titles.findIndex((tt) => (tt || "").includes("نام از راه بلر"));
  const cardBlur = cards.nth(blurIdx);
  await cardBlur.getByRole("button", { name: "تغییر نام رزومه" }).click();
  const inputB = cardBlur.locator("input");
  await inputB.waitFor({ timeout: 5000 });
  await inputB.fill("   ");
  await page.keyboard.press("Enter");
  await page.getByText("رزومه من - 4", { exact: true }).first().waitFor({ timeout: 10000 });
  check(true, "empty rename falls back to «رزومه من - 4» (auto-numbered)");

  // --- §7 per-resume category: new resumes inherit the user's ----------------
  await api("/auth/me", { method: "PATCH", body: JSON.stringify({ occupationCategory: "design-creative" }) }, tok);
  await page.reload({ waitUntil: "domcontentloaded" });
  await cards.first().waitFor({ timeout: 20000 });
  await newAndBack();
  const cardNew = page.locator('[data-testid="resume-card"]', { hasText: "رزومه من - 5" });
  check((await cardNew.count()) === 1, "post-category resume is «رزومه من - 5»");
  check(
    (await cardNew.getByText("طراحی و گرافیک").count()) === 1,
    "new resume's card shows ITS OWN category label (design-creative)",
  );
  // «رزومه من - 2» was created before the PATCH and never renamed → still null.
  check(
    (await page.locator('[data-testid="resume-card"]', { hasText: "رزومه من - 2" }).getByText("آزاد", { exact: true }).count()) === 1,
    "older resume keeps the «آزاد» fallback — categories are per-resume",
  );
  // Full save/reload round-trip of a resume carrying the new field cannot 400.
  const full = await api(`/resumes/${r1.id}`, {}, tok);
  await api(`/resumes/${r1.id}`, { method: "PUT", body: JSON.stringify(full) }, tok);
  check(true, "PUT round-trip with occupationCategory does not 400");

  // --- behaviours intact: open + cross-user ----------------------------------
  await cards.nth(0).locator('button[aria-label*="ویرایش"]').click();
  await page.waitForURL(/\?resume=/, { timeout: 15000 });
  check(page.url().includes("?resume="), "card body still opens the editor");
  const regB = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: `dash-fx-b-${stamp}@test.local`, password: "S3curePass!x" }),
  });
  let crossStatus = 0;
  try {
    await api(`/resumes/${r1.id}`, {}, regB.tokens.accessToken);
    crossStatus = 200;
  } catch (e) {
    crossStatus = Number(String(e.message).match(/-> (\d+)/)?.[1] ?? 0);
  }
  check(crossStatus === 403 || crossStatus === 404, `cross-user resume id rejected (${crossStatus})`);

  // --- §4/§5 dark mode + responsive steps -------------------------------------
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await cards.first().waitFor({ timeout: 20000 });
  await page.screenshot({ path: `${OUT}/desktop-light.png`, fullPage: true });
  await page.getByRole("button", { name: "تغییر حالت روشن/تاریک" }).click();
  await page.waitForTimeout(400);
  const darkBg = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="resume-card"]');
    let el = card.parentElement;
    while (el && getComputedStyle(el).backgroundColor === "rgba(0, 0, 0, 0)") el = el.parentElement;
    return getComputedStyle(el).backgroundColor;
  });
  const [dr, dg, db] = (darkBg.match(/\d+/g) || []).map(Number);
  check(Math.max(dr, dg, db) - Math.min(dr, dg, db) <= 6 && dr < 70, `container bg neutral dark grey in dark mode (${darkBg})`);
  await page.screenshot({ path: `${OUT}/desktop-dark.png`, fullPage: true });
  await page.getByRole("button", { name: "تغییر حالت روشن/تاریک" }).click();

  for (const [w, h, name, expected] of [
    [1100, 900, "laptop-lg", 3],
    [820, 1180, "tablet", 2],
    [390, 844, "phone", 1],
  ]) {
    const ctxR = await browser.newContext({ viewport: { width: w, height: h } });
    const pageR = await ctxR.newPage();
    pageR.on("console", (m) => m.type() === "error" && errors.push({ url: pageR.url(), text: m.text() }));
    await seedTokens(pageR, reg.tokens);
    await pageR.locator('[data-testid="resume-card"]').first().waitFor({ timeout: 20000 });
    check((await colCount(pageR)) === expected, `${name} (${w}px): ${expected} columns`);
    const noHScroll = await pageR.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    );
    check(noHScroll, `${name}: no horizontal overflow (RTL)`);
    // Truncation via lineClamp (title + occupation) is intended ellipsis, not a
    // layout clip — exclude those; flag only real overflow (buttons, date rows).
    const clipped = await pageR.evaluate(() => {
      const card = document.querySelector('[data-testid="resume-card"]');
      const clamped = (el) => getComputedStyle(el).webkitLineClamp !== "none";
      return (
        card.scrollWidth > card.clientWidth + 1 ||
        [...card.querySelectorAll("button")].some((el) => el.scrollWidth > el.clientWidth + 1) ||
        [...card.querySelectorAll("p")].some((el) => !clamped(el) && el.scrollWidth > el.clientWidth + 1)
      );
    });
    check(!clipped, `${name}: nothing clips inside the card`);
    await pageR.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    await ctxR.close();
  }

  // next-themes injects a no-flash <script> into the component tree; React 19
  // emits a benign dev-only "script tag while rendering" warning for it. It is
  // pre-existing (the dashboard mounted ThemeProvider before these fixes) and
  // unrelated to this change, so it is excluded from the regression bar.
  const relevant = errors.filter(
    (e) => e.url.includes("/dashboard") && !e.text.includes("Encountered a script tag"),
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
