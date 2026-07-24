/**
 * Remainder of the occupation/dashboard verification: the steps after the
 * duplicate action, which is blocked by a PRE-EXISTING backend serializer bug
 * (PUT of a full resume under a fresh id 409s on child-row ids — reproduced
 * with pre-task endpoints only, so it is skipped here and reported).
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const API = "http://localhost:4000";
const OUT = "scripts/out-occupation";
mkdirSync(OUT, { recursive: true });

const SOFTWARE_EXP_PH = "مثال: توسعه‌دهنده فرانت‌اند";

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

const run = async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const errors = [];
  const stamp = Date.now();

  const reg = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: `occ-rem-${stamp}@test.local`, password: "S3curePass!x" }),
  });
  const tok = reg.tokens.accessToken;
  await api("/auth/me", { method: "PATCH", body: JSON.stringify({ occupationCategory: "finance-accounting" }) }, tok);
  await api("/resumes", { method: "POST", body: "{}" }, tok);
  await api("/resumes", { method: "POST", body: "{}" }, tok);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([a, r]) => {
      window.localStorage.setItem("ai-res:accessToken", a);
      window.localStorage.setItem("ai-res:refreshToken", r);
    },
    [tok, reg.tokens.refreshToken],
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator('[data-testid="resume-card"]').first().waitFor({ timeout: 20000 });
  const cards0 = await page.locator('[data-testid="resume-card"]').count();
  check(cards0 === 2, `R1 two seeded cards render (${cards0})`);
  await page.screenshot({ path: `${OUT}/dashboard-light-fixed.png`, fullPage: true });

  // rename
  await page.getByTitle("تغییر نام رزومه").first().click();
  const renameInput = page.locator('[data-testid="resume-card"] input').first();
  await renameInput.fill("رزومه آزمایشی");
  await renameInput.press("Enter");
  await page.getByText("رزومه آزمایشی").first().waitFor({ timeout: 20000 });
  const list = await api("/resumes", {}, tok);
  check(list.some((r) => r.title === "رزومه آزمایشی"), "R2 inline rename persists server-side");

  // delete with confirmation
  await page.getByRole("button", { name: "حذف", exact: true }).first().click();
  await page.getByText("این رزومه برای همیشه حذف می‌شود. مطمئن هستید؟").waitFor({ timeout: 10000 });
  await page.locator('[role="dialog"]').getByRole("button", { name: "حذف", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="resume-card"]').length === 1,
    undefined,
    { timeout: 20000 },
  );
  check(true, "R3 delete (with confirmation) removes the card");

  // category change from the panel → editor placeholders update
  await page.locator('select[aria-label="حوزه شغلی"]').selectOption("software-it");
  await page.waitForTimeout(1500);
  const me = await api("/auth/me", {}, tok);
  check(me.occupationCategory === "software-it", `R4 panel change persists (${me.occupationCategory})`);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.locator(".a4-page").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);
  check(
    (await page.locator(`input[placeholder="${SOFTWARE_EXP_PH}"]`).count()) > 0,
    "R5 editor shows the new category's placeholders after panel change",
  );
  await ctx.close();

  // mobile
  const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page3 = await ctx3.newPage();
  page3.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page3.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page3.evaluate(
    ([a, r]) => {
      window.localStorage.setItem("ai-res:accessToken", a);
      window.localStorage.setItem("ai-res:refreshToken", r);
    },
    [tok, reg.tokens.refreshToken],
  );
  await page3.reload({ waitUntil: "domcontentloaded" });
  await page3.locator('[data-testid="resume-card"]').first().waitFor({ timeout: 20000 });
  await page3.screenshot({ path: `${OUT}/dashboard-mobile.png`, fullPage: true });
  check(true, "R6 mobile dashboard renders");
  await ctx3.close();

  const realErrors = errors.filter((e) => !e.includes("favicon"));
  check(realErrors.length === 0, `R7 zero console errors (${realErrors.length})`);
  if (realErrors.length) console.log(realErrors.slice(0, 10).join("\n---\n"));

  await browser.close();
  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error("SCRIPT ERROR:", err);
  process.exit(1);
});
