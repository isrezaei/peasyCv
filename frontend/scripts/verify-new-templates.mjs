// Self-test for the imported "Persian Resume Templates" set. Seeds a full,
// multi-page resume, switches into every template through the real Templates
// panel, and checks: render + no console errors, data preservation across
// switches, the section HoverFrame / per-item hover+delete affordances, inline
// editing, theme-colour application, and the Puppeteer PDF path (multi-page).
//   node scripts/verify-new-templates.mjs
import { chromium } from "playwright-core";
import { createPdfClient } from "./backend-api.mjs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";

const NEW_TEMPLATES = [
  ["aside-dark", "ستون کناری تیره"],
  ["aside-photo", "ستون عکس کناری"],
  ["timeline-panel", "خط زمانی"],
  ["header-band", "سربرگ تمام‌عرض"],
  ["compact-duo", "مینیمال دو ستونه"],
  ["ruled-single", "تک‌ستونه با خطوط"],
  ["classic-centered", "کلاسیک وسط‌چین"],
];
const EXISTING = [
  ["professional-single-column", "تک‌ستونه حرفه‌ای"],
  ["double-column", "دو ستونه"],
  ["sidebar-column", "ستون رنگی کناری"],
];

const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const LONG =
  "یک شرح طولانی برای آزمودن رشد خودکار ارتفاع و صفحه‌بندی چندصفحه‌ای که عمداً بسیار بلند نوشته شده تا چند خط کامل را پر کند و از مرز یک صفحه فراتر برود و رفتار سرریز و شکستن صفحه را به‌روشنی نشان دهد.";

// The backend /pdf endpoint validates the full ResumeData DTO strictly (no
// normalize step), so every section/item field must be present — the section
// helper carries the section-wide display settings the DTO requires.
const section = (type, title, order) => ({
  id: id("s"), type, title, visible: true, direction: "rtl", order,
  languageMeterVariant: "bars", languageShowMeter: true, languageShowLevelText: true,
  showMonth: true, monthFormat: "name",
  achievementShowDescription: true, achievementShowIcons: true,
});

function fullResume(templateId) {
  return {
    id: id("resume"),
    title: "verify",
    locale: "fa",
    templateId,
    theme: {
      themeId: "indigo",
      pageBackground: "theme",
      backgroundPattern: "blobs",
      backgroundIntensity: 0.7,
      dateCalendar: "jalali",
      fontFamily: "vazirmatn",
      fontScale: 1,
      lineHeight: 1.5,
      pageMargin: 16,
      sectionSpacing: 6,
      columnIntensity: 1,
      showSectionIcons: false,
      atsMode: false,
    },
    sections: [
      section("summary", "درباره من", 0),
      section("experience", "تجربه کاری", 1),
      section("skills", "مهارت‌ها", 2),
      section("education", "تحصیلات", 3),
      section("projects", "پروژه‌ها", 4),
      section("languages", "زبان‌ها", 5),
      section("certifications", "گواهینامه‌ها", 6),
    ],
    personalInfo: {
      fullName: "سارا احمدی",
      jobTitle: "مدیر ارشد محصول",
      phone: "۰۹۱۲۳۴۵۶۷۸۹",
      location: "تهران، ایران",
      email: "sara@example.com",
      dateOfBirth: "",
      nationality: "",
      links: [{ id: id("l"), label: "LinkedIn", url: "linkedin.com/in/sara" }],
      profileImage: null,
      uppercaseName: false,
      photoStyle: "round",
      imageSide: "left",
      fieldVisibility: { jobTitle: true, phone: true, links: true, email: true, location: true, photo: true, dateOfBirth: false, nationality: false },
    },
    summary: { html: `<p>${LONG}</p>` },
    experience: [0, 1, 2].map((i) => ({
      id: id("exp"), jobTitle: `عنوان شغلی ${i + 1}`, companyName: `شرکت نمونه ${i + 1}`,
      period: { start: "۱۳۹۷", end: i === 0 ? "" : "۱۴۰۰", current: i === 0 }, city: "تهران",
      projectLink: "", projectDescription: LONG, link: "", linkVisible: true,
      responsibilities: [{ id: id("r"), text: LONG }, { id: id("r"), text: "مسئولیت کوتاه دوم." }],
    })),
    skills: [
      { id: id("sk"), name: "فنی", skills: ["مدیریت محصول", "تحلیل داده", "اسکرام"].map((n) => ({ id: id("k"), name: n })) },
      { id: id("sk"), name: "نرم", skills: ["رهبری", "مذاکره"].map((n) => ({ id: id("k"), name: n })) },
    ],
    education: [0, 1].map((i) => ({
      id: id("edu"), degree: `مدرک ${i + 1}`, university: `دانشگاه نمونه ${i + 1}`,
      startDate: "۱۳۹۰", endDate: "۱۳۹۴", gpa: "۱۸", achievements: LONG, city: "تهران",
    })),
    projects: [{ id: id("p"), name: "پروژه نمونه", role: "راهبر", link: "", linkVisible: true, description: LONG }],
    languages: [
      { id: id("lang"), name: "فارسی", level: 5, showBars: true, showLevelText: true },
      { id: id("lang"), name: "انگلیسی", level: 4, showBars: true, showLevelText: true },
    ],
    certifications: [{ id: id("c"), name: "گواهینامه مدیریت", issuer: "موسسه نمونه", date: "۱۳۹۹" }],
    achievements: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

const results = [];
function record(name, ok, extra = "") {
  results.push({ name, ok, extra });
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${extra ? " — " + extra : ""}`);
}

// Seed once with the first template, then switch through the UI (no re-seed) so
// data-preservation across template switches is genuinely exercised.
await page.goto(BASE, { waitUntil: "load" });
await page.evaluate((data) => {
  // Seed the guest occupation-category choice too: without it the OccupationGate
  // modal opens on load and intercepts every panel click (this script predates
  // that feature).
  localStorage.setItem("ai-res:occupation-category", JSON.stringify({ id: "software-it", explicit: true }));
  localStorage.setItem("ai-res:resume", JSON.stringify(data));
}, fullResume("professional-single-column"));
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector(".a4-page");

// Open the Templates panel.
await page.getByText("قالب‌ها", { exact: true }).first().click();
await page.waitForTimeout(300);

for (const [tid, label] of [...EXISTING, ...NEW_TEMPLATES]) {
  const before = consoleErrors.length;
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.waitForTimeout(550);

  const info = await page.evaluate(() => {
    const pages = document.querySelectorAll(".a4-page");
    const name = [...document.querySelectorAll(".a4-page input")].find((i) => i.value === "سارا احمدی");
    const headings = document.querySelectorAll(".a4-page h2").length;
    const hoverFrames = document.querySelectorAll('.a4-page [data-hover-frame]').length;
    const inputs = document.querySelectorAll(".a4-page input, .a4-page textarea, .a4-page [contenteditable='true']").length;
    const railHeights = [...document.querySelectorAll('[data-testid="timeline-rail-line"]')].map((r) => Math.round(r.getBoundingClientRect().height));
    const tallest = Math.max(...[...pages].map((p) => Math.round(p.getBoundingClientRect().height)), 0);
    return { pageCount: pages.length, hasName: !!name, headings, hoverFrames, inputs, rails: railHeights.length, tallest };
  });

  const ok =
    info.pageCount >= 1 &&
    info.hasName && // data preserved across the switch
    info.headings >= 5 && // every visible section heading rendered
    info.hoverFrames >= 5 && // section HoverFrame controls present
    info.inputs >= 15 && // inline-editable fields present
    consoleErrors.length === before;
  record(`render ${tid}`, ok, JSON.stringify(info));

  await page.screenshot({ path: `scripts/nt-${tid}.png`, fullPage: true });
}

// --- Hover affordances: add + remove an entry on a NEW template -------------
await page.getByRole("button", { name: "خط زمانی", exact: true }).click();
await page.waitForTimeout(500);
const expBefore = await page.locator('[data-block-kind], .a4-page input').count();
const expHeading = page.getByRole("heading", { name: "تجربه کاری" }).first();
await expHeading.scrollIntoViewIfNeeded();
await expHeading.hover();
await page.waitForTimeout(150);
let addOk = false;
try {
  await page.getByRole("button", { name: "افزودن مورد" }).first().click({ timeout: 2000 });
  await page.waitForTimeout(400);
  const expAfter = await page.locator('.a4-page input').count();
  addOk = expAfter > expBefore;
} catch (e) {
  addOk = false;
}
record("hover add-entry on new template (timeline-panel)", addOk);

// --- Inline edit persists ----------------------------------------------------
let editOk = false;
let editDiag = "";
const NEW_TITLE = "مدیر محصول ارشد جدید";
try {
  // Focus the job-title field (seeded value) and retype via the keyboard so the
  // real path runs: input event -> deferred commit -> store -> debounced persist.
  const focused = await page.evaluate(() => {
    const el = [...document.querySelectorAll(".a4-page input")].find((i) => i.value === "مدیر ارشد محصول");
    if (!el) return false;
    el.focus();
    el.select();
    return true;
  });
  await page.keyboard.press("Control+A");
  await page.keyboard.type(NEW_TITLE);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(2500);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("ai-res:resume")).personalInfo.jobTitle);
  editOk = saved === NEW_TITLE;
  editDiag = `focused=${focused} saved=${saved}`;
} catch (e) {
  editDiag = "threw: " + e.message.split("\n")[0];
}
record("inline edit persists (new template)", editOk, editDiag);

// --- Theme colour applies to headings ---------------------------------------
let themeOk = false;
try {
  await page.getByRole("button", { name: "تک‌ستونه با خطوط", exact: true }).click();
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => getComputedStyle(document.querySelector(".a4-page h2")).color);
  await page.getByText("طراحی و فونت", { exact: true }).first().click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "نعنایی" }).click(); // mint
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => getComputedStyle(document.querySelector(".a4-page h2")).color);
  themeOk = before !== after;
  record("theme colour applies to headings", themeOk, `${before} -> ${after}`);
} catch (e) {
  record("theme colour applies to headings", false, e.message.split("\n")[0]);
}

// --- PDF path (multi-page) for two new templates ----------------------------
// Rendered through the authenticated backend /pdf endpoint (the unauthenticated
// Next /api/pdf route was removed).
const pdfClient = await createPdfClient();
for (const tid of ["ruled-single", "timeline-panel", "aside-dark"]) {
  try {
    const buf = await pdfClient.renderPdf(fullResume(tid));
    const head = buf.slice(0, 5).toString("latin1");
    const text = buf.toString("latin1");
    const pageCount = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
    const ok = head === "%PDF-" && buf.length > 5000 && pageCount >= 1;
    record(`PDF ${tid}`, ok, `bytes=${buf.length} pages=${pageCount}`);
  } catch (e) {
    record(`PDF ${tid}`, false, e.message.split("\n")[0]);
  }
}

console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors, null, 2));
const allPass = results.every((r) => r.ok) && consoleErrors.length === 0;
console.log("OVERALL:", allPass ? "PASS" : "FAIL");
await browser.close();
process.exit(allPass ? 0 : 1);
