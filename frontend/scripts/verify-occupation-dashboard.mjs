/**
 * End-to-end verification for the occupation-category system + dashboard
 * redesign (July 2026):
 *   A. fresh guest → prompted once → picks «مالی و حسابداری» → finance
 *      placeholders shown; reload → not prompted again.
 *   B. that guest types content, then logs in (API register + token adopt) →
 *      category carried to the account, guest resume merged as newest, no 400.
 *   C. a user with no category logs in → prompted once; skip → «آزاد» persisted.
 *   D. dashboard: redesigned cards render (light/dark/mobile screenshots),
 *      newest badge, duplicate/rename/delete work, category select PATCHes and
 *      the editor then shows the new placeholders while typed text survives.
 *   E. zero console errors; download validation still flags empty fields.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const API = "http://localhost:4000";
const OUT = "scripts/out-occupation";
mkdirSync(OUT, { recursive: true });

const PROMPT_TITLE = "حوزه شغلی شما چیست؟";
const FINANCE_LABEL = "مالی و حسابداری";
const FINANCE_EXP_PH = "مثال: کارشناس حسابداری مالی";
const SOFTWARE_LABEL = "نرم‌افزار و فناوری اطلاعات";
const SOFTWARE_EXP_PH = "مثال: توسعه‌دهنده فرانت‌اند";
const GENERIC_EXP_PH = "مثال: مهندس نرم‌افزار";

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
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json();
};

const register = (email) =>
  api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password: "S3curePass!x" }),
  });

const trackErrors = (page, bucket) => {
  page.on("console", (msg) => {
    if (msg.type() === "error") bucket.push(msg.text());
  });
  page.on("pageerror", (err) => bucket.push(String(err)));
};

const promptCount = (page) => page.getByText(PROMPT_TITLE).count();

const run = async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const errors = [];
  const stamp = Date.now();

  // ---------- A: fresh guest ----------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  trackErrors(page, errors);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.getByText(PROMPT_TITLE).waitFor({ timeout: 20000 });
  check(true, "A1 guest first visit shows the category prompt");
  await page.getByRole("button", { name: FINANCE_LABEL }).click();
  await page.locator(".a4-page").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  check((await promptCount(page)) === 0, "A2 prompt closes after choosing");
  check(
    (await page.locator(`input[placeholder="${FINANCE_EXP_PH}"]`).count()) > 0,
    "A3 finance placeholders render in the editor",
  );
  const guestChoice = await page.evaluate(() =>
    window.localStorage.getItem("ai-res:occupation-category"),
  );
  check(
    guestChoice === JSON.stringify({ id: "finance-accounting", explicit: true }),
    `A4 guest choice persisted (${guestChoice})`,
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".a4-page").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1200);
  check((await promptCount(page)) === 0, "A5 reload does not re-prompt");
  check(
    (await page.locator(`input[placeholder="${FINANCE_EXP_PH}"]`).count()) > 0,
    "A6 finance placeholders survive reload",
  );

  // ---------- B: guest edits, then logs in — carry + merge ----------
  const nameInput = page.locator('input[placeholder="علی محمدی"]').first();
  await nameInput.click();
  await nameInput.fill("تست کاربر");
  await page.locator(".a4-page").first().click(); // blur → deferred commit
  await page.waitForTimeout(1500);
  const guestResume = await page.evaluate(() =>
    window.localStorage.getItem("ai-res:resume"),
  );
  check(Boolean(guestResume), "B1 guest edit created the guest resume key");
  const user1 = { email: `occ-verify-${stamp}-a@test.local` };
  const reg1 = await register(user1.email);
  check(reg1.user.occupationCategory === null, "B2 fresh account starts with null category");
  await page.evaluate(
    ([a, r]) => {
      window.localStorage.setItem("ai-res:accessToken", a);
      window.localStorage.setItem("ai-res:refreshToken", r);
    },
    [reg1.tokens.accessToken, reg1.tokens.refreshToken],
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".a4-page").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(2500); // merge + carry PATCH
  check((await promptCount(page)) === 0, "B3 explicit guest choice suppresses the login prompt");
  const me1 = await api("/auth/me", {}, reg1.tokens.accessToken);
  check(
    me1.occupationCategory === "finance-accounting",
    `B4 category carried onto the account (${me1.occupationCategory})`,
  );
  const list1 = await api("/resumes", {}, reg1.tokens.accessToken);
  check(list1.length >= 1, "B5 guest resume merged into the account");
  const merged = await api(`/resumes/${list1[0].id}`, {}, reg1.tokens.accessToken);
  check(
    merged.personalInfo.fullName === "تست کاربر",
    "B6 merged (newest) resume keeps the guest-typed name",
  );

  // ---------- C: user with no category → prompted once; skip → آزاد ----------
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page2 = await ctx2.newPage();
  trackErrors(page2, errors);
  const user2 = { email: `occ-verify-${stamp}-b@test.local` };
  const reg2 = await register(user2.email);
  await page2.goto(BASE, { waitUntil: "domcontentloaded" });
  await page2.evaluate(
    ([a, r]) => {
      window.localStorage.setItem("ai-res:accessToken", a);
      window.localStorage.setItem("ai-res:refreshToken", r);
      window.localStorage.removeItem("ai-res:occupation-category");
    },
    [reg2.tokens.accessToken, reg2.tokens.refreshToken],
  );
  await page2.reload({ waitUntil: "domcontentloaded" });
  await page2.getByText(PROMPT_TITLE).waitFor({ timeout: 20000 });
  check(true, "C1 category-less account is prompted after login");
  await page2.getByRole("button", { name: "رد شدن" }).click();
  await page2.waitForTimeout(1500);
  const me2 = await api("/auth/me", {}, reg2.tokens.accessToken);
  check(me2.occupationCategory === "azad", `C2 skip persists «آزاد» (${me2.occupationCategory})`);
  check(
    (await page2.locator(`input[placeholder="${GENERIC_EXP_PH}"]`).count()) > 0,
    "C3 skip shows the generic defaults",
  );
  await page2.reload({ waitUntil: "domcontentloaded" });
  await page2.locator(".a4-page").first().waitFor({ timeout: 20000 });
  await page2.waitForTimeout(1200);
  check((await promptCount(page2)) === 0, "C4 skipped account is never re-prompted");
  await ctx2.close();

  // ---------- E (early, same editor session): download validation ----------
  await page.getByRole("button", { name: /دانلود/ }).first().click();
  await page.waitForTimeout(1000);
  check(
    (await page.getByText("برای دانلود، این موارد را کامل کنید").count()) > 0,
    "E1 empty-field validation still blocks download",
  );

  // ---------- D: dashboard ----------
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page.locator('[data-testid="resume-card"]').first().waitFor({ timeout: 20000 });
  const cards0 = await page.locator('[data-testid="resume-card"]').count();
  check(cards0 >= 1, `D1 cards render (${cards0})`);
  check(
    (await page.locator('[data-testid="newest-badge"]').count()) === 1,
    "D2 exactly one newest badge",
  );
  const selectValue = await page
    .locator('select[aria-label="حوزه شغلی"]')
    .inputValue();
  check(selectValue === "finance-accounting", `D3 category select shows the account value (${selectValue})`);
  await page.screenshot({ path: `${OUT}/dashboard-light.png`, fullPage: true });

  // dark mode
  await page.getByRole("button", { name: "تغییر حالت روشن/تاریک" }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/dashboard-dark.png`, fullPage: true });
  await page.getByRole("button", { name: "تغییر حالت روشن/تاریک" }).click();
  await page.waitForTimeout(400);

  // duplicate
  await page.getByRole("button", { name: "کپی" }).first().click();
  await page.waitForFunction(
    (n) => document.querySelectorAll('[data-testid="resume-card"]').length === n + 1,
    cards0,
    { timeout: 20000 },
  );
  check(true, "D4 duplicate adds a card");

  // rename (first card title)
  await page.locator('[data-testid="resume-card"]').first().hover();
  await page.getByTitle("تغییر نام رزومه").first().click();
  const renameInput = page.locator('[data-testid="resume-card"] input').first();
  await renameInput.fill("رزومه آزمایشی");
  await renameInput.press("Enter");
  await page.getByText("رزومه آزمایشی").first().waitFor({ timeout: 20000 });
  check(true, "D5 inline rename persists");

  // delete the duplicate (confirm dialog = the one true overlay)
  await page.getByRole("button", { name: "حذف", exact: true }).first().click();
  await page.getByText("این رزومه برای همیشه حذف می‌شود. مطمئن هستید؟").waitFor({ timeout: 10000 });
  await page
    .locator('[role="dialog"]')
    .getByRole("button", { name: "حذف", exact: true })
    .click();
  await page.waitForFunction(
    (n) => document.querySelectorAll('[data-testid="resume-card"]').length === n,
    cards0,
    { timeout: 20000 },
  );
  check(true, "D6 delete (with confirmation) removes the card");

  // category change from the panel → editor placeholders update, typed text kept
  await page.locator('select[aria-label="حوزه شغلی"]').selectOption("software-it");
  await page.waitForTimeout(1500);
  const me1b = await api("/auth/me", {}, reg1.tokens.accessToken);
  check(me1b.occupationCategory === "software-it", `D7 panel change persists (${me1b.occupationCategory})`);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.locator(".a4-page").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);
  check(
    (await page.locator(`input[placeholder="${SOFTWARE_EXP_PH}"]`).count()) > 0,
    "D8 editor shows the new category's placeholders",
  );
  check(
    (await page.locator('input[value="تست کاربر"]').count()) > 0,
    "D9 typed content is never overwritten by a category change",
  );

  // mobile
  const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page3 = await ctx3.newPage();
  trackErrors(page3, errors);
  await page3.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await page3.evaluate(
    ([a, r]) => {
      window.localStorage.setItem("ai-res:accessToken", a);
      window.localStorage.setItem("ai-res:refreshToken", r);
    },
    [reg1.tokens.accessToken, reg1.tokens.refreshToken],
  );
  await page3.reload({ waitUntil: "domcontentloaded" });
  await page3.locator('[data-testid="resume-card"]').first().waitFor({ timeout: 20000 });
  await page3.screenshot({ path: `${OUT}/dashboard-mobile.png`, fullPage: true });
  check(true, "D10 mobile dashboard renders");
  await ctx3.close();
  await ctx.close();

  const realErrors = errors.filter((e) => !e.includes("favicon"));
  check(realErrors.length === 0, `E2 zero console errors (${realErrors.length})`);
  if (realErrors.length) console.log(realErrors.slice(0, 10).join("\n---\n"));

  await browser.close();
  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error("SCRIPT ERROR:", err);
  process.exit(1);
});
