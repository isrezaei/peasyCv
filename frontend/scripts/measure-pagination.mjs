// Pagination regression check: injects a worst-case resume (all sections, many
// items) plus a typical small resume and asserts that no block overflows past
// the A4 frame or the page content box on any page. The worst case runs once
// per period-date / experience-link display mode (month name / month number /
// year only / links hidden) so the conditional height estimators are proven
// against the live Chrome render in every mode. Resume persistence is
// API-backed now, so fixtures are injected through the store's headless hook —
// `window.__RESUME_DATA__`, which the /print route hydrates from directly (see
// app/print/page.tsx). Starts a Next dev server itself when none is listening
// on http://localhost:3000:
//   node scripts/measure-pagination.mjs
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const BASE_URL = process.env.SMOKE_URL ?? "http://localhost:3000";
const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = join(SCRIPTS_DIR, "..");

async function serverUp() {
  try {
    await fetch(BASE_URL);
    return true;
  } catch {
    return false;
  }
}

// Launch the dev server ourselves when nothing is listening, and kill the whole
// process tree on exit so the run leaves no orphan next-dev behind.
let devProc = null;
if (!(await serverUp())) {
  console.log("no server on", BASE_URL, "— starting `next dev`...");
  devProc = spawn("npx", ["next", "dev"], { cwd: FRONTEND_DIR, shell: true, stdio: "ignore" });
  let up = false;
  for (let i = 0; i < 180 && !up; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    up = await serverUp();
  }
  if (!up) {
    console.error("dev server did not come up within 180s");
    process.exit(1);
  }
}

function shutdownDevServer() {
  if (!devProc) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(devProc.pid), "/T", "/F"], { shell: true });
  } else {
    devProc.kill();
  }
}

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});

const consoleErrors = [];

const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Schema-valid worst case (all sections, many items). `modes` tunes the display
 * settings under test: `showMonth` / `monthFormat` land on the experience and
 * education section rows, `linkVisible` on every experience item.
 */
function buildWorstCase({ showMonth = true, monthFormat = "name", linkVisible = true } = {}) {
  const sectionTypes = [
    "summary",
    "experience",
    "skills",
    "education",
    "projects",
    "languages",
    "certifications",
  ];
  const sections = sectionTypes.map((type, index) => ({
    id: id("sec"),
    type,
    title: type,
    visible: true,
    direction: "rtl",
    order: index,
    languageMeterVariant: "bars",
    languageShowMeter: true,
    languageShowLevelText: true,
    showMonth,
    monthFormat,
  }));

  const experience = Array.from({ length: 6 }, (_, i) => ({
    id: id("exp"),
    jobTitle: `مهندس نرم‌افزار ارشد ${i + 1}`,
    companyName: "شرکت فناوری نمونه با نام طولانی",
    period: { start: "2019-04-01", end: "2023-09-01", current: false },
    city: "تهران",
    projectLink: "",
    projectDescription:
      "توضیح نسبتاً بلندی دربارهٔ نقش و دستاوردها که احتمالاً به دو خط کشیده می‌شود و فضای بیشتری می‌گیرد.",
    link: "https://github.com/example/project",
    linkVisible,
    responsibilities: Array.from({ length: 4 }, () => ({
      id: id("resp"),
      text: "یک مسئولیت یا دستاورد کلیدی همراه با عدد و نتیجهٔ مشخص که ممکن است طولانی باشد.",
    })),
  }));

  const skills = Array.from({ length: 4 }, (_, i) => ({
    id: id("grp"),
    name: `گروه مهارت ${i + 1}`,
    skills: Array.from({ length: 8 }, (_, j) => ({ id: id("sk"), name: `مهارت ${j + 1}` })),
  }));

  const education = Array.from({ length: 5 }, (_, i) => ({
    id: id("edu"),
    degree: `کارشناسی ارشد رشتهٔ نمونه ${i + 1}`,
    university: "دانشگاه نمونهٔ تهران",
    startDate: "2015-09-01",
    endDate: "2019-06-01",
    gpa: "۱۸/۵",
    achievements: "افتخارات و دستاوردهای تحصیلی که ممکن است به دو خط برسد و فضای بیشتری بگیرد.",
    city: "تهران",
  }));

  const projects = Array.from({ length: 5 }, (_, i) => ({
    id: id("prj"),
    name: `پروژهٔ نمونه ${i + 1}`,
    role: "توسعه‌دهندهٔ ارشد",
    link: "https://example.com",
    linkVisible: true,
    description: "توضیح کوتاهی دربارهٔ هدف و نتیجهٔ پروژه که ممکن است به دو خط برسد.",
  }));

  const languages = Array.from({ length: 8 }, (_, i) => ({
    id: id("lng"),
    name: `زبان ${i + 1}`,
    level: (i % 5) + 1,
    showBars: true,
    showLevelText: true,
  }));

  const certifications = Array.from({ length: 6 }, (_, i) => ({
    id: id("cert"),
    name: `گواهینامهٔ نمونه ${i + 1}`,
    issuer: "مؤسسهٔ صادرکننده",
    date: "2022-05-01",
  }));

  const now = new Date().toISOString();
  return {
    id: id("resume"),
    title: "رزومه نمونه",
    locale: "fa",
    templateId: "professional-single-column",
    theme: {
      themeId: "sage",
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
    },
    sections,
    personalInfo: {
      fullName: "سارا احمدی نمونه",
      jobTitle: "مهندس نرم‌افزار",
      phone: "۰۹۱۲۱۲۳۴۵۶۷",
      location: "تهران، ایران",
      email: "sara@example.com",
      dateOfBirth: "",
      nationality: "",
      links: [
        { id: id("ln"), label: "LinkedIn", url: "linkedin.com/in/example" },
        { id: id("ln"), label: "GitHub", url: "github.com/example" },
      ],
      profileImage: null,
      uppercaseName: false,
      photoStyle: "round",
      fieldVisibility: {
        jobTitle: true,
        phone: true,
        links: true,
        email: true,
        location: true,
        photo: true,
        dateOfBirth: false,
        nationality: false,
      },
    },
    summary: {
      html: "<p>خلاصه‌ای نسبتاً بلند که چند خط طول می‌کشد تا ارتفاع واقعی بخش خلاصه را بسنجیم و مطمئن شویم تخمین ارتفاع درست است و سرریز رخ نمی‌دهد.</p>",
    },
    experience,
    skills,
    education,
    projects,
    languages,
    certifications,
    createdAt: now,
    updatedAt: now,
  };
}

async function measureOverflow(page, label) {
  await page.waitForSelector(".a4-page");
  await page.waitForTimeout(500);
  const report = await page.evaluate(() => {
    const pxPerMm = 96 / 25.4;
    const pages = [...document.querySelectorAll(".a4-page")];
    return pages.map((pageEl, i) => {
      const pr = pageEl.getBoundingClientRect();
      const inner = pageEl.querySelector(":scope > div:last-child") || pageEl;
      const padBottom = parseFloat(getComputedStyle(inner).paddingBottom) || 0;
      const blocks = [...pageEl.querySelectorAll("[data-block-id]")];
      let maxBottom = pr.top;
      let lastKind = null;
      for (const b of blocks) {
        const br = b.getBoundingClientRect();
        if (br.bottom > maxBottom) {
          maxBottom = br.bottom;
          lastKind = b.getAttribute("data-block-kind");
        }
      }
      return {
        page: i,
        pageHeightMm: +(pr.height / pxPerMm).toFixed(1),
        blocks: blocks.length,
        fillMm: +((maxBottom - pr.top) / pxPerMm).toFixed(1),
        overflowPastFrameMm: +(Math.max(0, maxBottom - pr.bottom) / pxPerMm).toFixed(2),
        overflowPastContentMm: +(Math.max(0, maxBottom - (pr.bottom - padBottom)) / pxPerMm).toFixed(2),
        lastKind,
      };
    });
  });
  console.log(`\n=== ${label} ===`);
  console.log(`pages: ${report.length}`);
  for (const p of report) {
    console.log(
      `  p${p.page}: blocks=${p.blocks} fill=${p.fillMm}mm pageH=${p.pageHeightMm}mm ` +
        `overflowFrame=${p.overflowPastFrameMm}mm overflowContent=${p.overflowPastContentMm}mm last=${p.lastKind}`,
    );
  }
  const worstFrame = Math.max(...report.map((p) => p.overflowPastFrameMm));
  const worstContent = Math.max(...report.map((p) => p.overflowPastContentMm));
  const ok = worstFrame === 0;
  console.log(
    `  WORST overflowPastFrame=${worstFrame}mm  overflowPastContent=${worstContent}mm  -> ${ok ? "PASS" : "FAIL"}`,
  );
  return ok;
}

/** A typical small resume: the worst case trimmed to seed-like item counts. */
function buildTypical() {
  const worst = buildWorstCase();
  return {
    ...worst,
    experience: worst.experience.slice(0, 1),
    skills: worst.skills.slice(0, 2),
    education: worst.education.slice(0, 1),
    projects: worst.projects.slice(0, 1),
    languages: worst.languages.slice(0, 2),
    certifications: worst.certifications.slice(0, 1),
  };
}

/** Fresh page per scenario so each gets its own injected fixture. */
async function runScenario(label, fixture, screenshotPath) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.addInitScript((data) => {
    window.__RESUME_DATA__ = data;
  }, fixture);
  await page.goto(`${BASE_URL}/print`, { waitUntil: "load", timeout: 120_000 });
  await page.waitForSelector('[data-pdf-ready="true"]', { timeout: 120_000 });
  const ok = await measureOverflow(page, label);
  await page.screenshot({ path: join(SCRIPTS_DIR, screenshotPath), fullPage: true });
  await page.close();
  return ok;
}

// The display-mode matrix the conditional estimators must hold for: the
// baseline (month name + links shown — the pre-change rendering), each month
// mode, and the hidden experience-link mode.
const scenarios = [
  {
    label: "WORST CASE — month NAME, links SHOWN (baseline)",
    fixture: buildWorstCase(),
    shot: "measure-worstcase.png",
  },
  {
    label: "WORST CASE — month NUMBER",
    fixture: buildWorstCase({ monthFormat: "number" }),
    shot: "measure-month-number.png",
  },
  {
    label: "WORST CASE — month HIDDEN (year only)",
    fixture: buildWorstCase({ showMonth: false }),
    shot: "measure-year-only.png",
  },
  {
    label: "WORST CASE — experience links HIDDEN",
    fixture: buildWorstCase({ linkVisible: false }),
    shot: "measure-links-hidden.png",
  },
  {
    label: "TYPICAL (seed-like item counts)",
    fixture: buildTypical(),
    shot: "measure-default.png",
  },
];

let allOk = true;
for (const scenario of scenarios) {
  const ok = await runScenario(scenario.label, scenario.fixture, scenario.shot);
  allOk = allOk && ok;
}

console.log("\nCONSOLE_ERRORS:", JSON.stringify(consoleErrors, null, 2));
console.log(`\nOVERALL: ${allOk ? "PASS — no page overflows the A4 frame" : "FAIL"}`);
await browser.close();
shutdownDevServer();
process.exit(allOk ? 0 : 1);
