// Cross-template pagination check. Renders a worst-case resume (all sections,
// many items) through the auth-free /print route — the SAME render path the PDF
// pipeline uses — once per template, and asserts for each:
//   • the page paginates (>= 2 fixed A4 pages) instead of growing one tall sheet,
//   • every .a4-page is a true A4 height (~297mm, never grown),
//   • no content overflows/clips past the page frame.
// Run with the server up:  SMOKE_URL=http://localhost:3100 node scripts/verify-pagination-all.mjs
import { chromium } from "playwright-core";

const BASE_URL = process.env.SMOKE_URL ?? "http://localhost:3000";
const A4_H_PX = (297 * 96) / 25.4; // 1122.5
const TOLERANCE_PX = 2;

const TEMPLATES = [
  "professional-single-column",
  "double-column",
  "sidebar-column",
  "aside-dark",
  "aside-photo",
  "timeline-panel",
  "header-band",
  "compact-duo",
  "ruled-single",
  "classic-centered",
];

const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

function buildWorstCase(templateId) {
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
  }));

  const experience = Array.from({ length: 6 }, (_, i) => ({
    id: id("exp"),
    jobTitle: `مهندس نرم‌افزار ارشد ${i + 1}`,
    companyName: "شرکت فناوری نمونه با نام طولانی",
    period: { start: "2019-06-01", end: i === 0 ? "" : "2022-09-01", current: i === 0 },
    city: "تهران",
    projectLink: "github.com/example/project",
    projectDescription:
      "توضیح نسبتاً بلندی دربارهٔ نقش و دستاوردها که احتمالاً به دو خط کشیده می‌شود و فضای بیشتری می‌گیرد.",
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
    startDate: "2014-09-01",
    endDate: "2018-06-01",
    gpa: "۱۸/۵",
    achievements: "افتخارات و دستاوردهای تحصیلی که ممکن است به دو خط برسد و فضای بیشتری بگیرد.",
    city: "تهران",
  }));

  const projects = Array.from({ length: 5 }, (_, i) => ({
    id: id("prj"),
    name: `پروژهٔ نمونه ${i + 1}`,
    role: "توسعه‌دهندهٔ ارشد",
    link: "example.com",
    description: "توضیح کوتاهی دربارهٔ هدف و نتیجهٔ پروژه که ممکن است به دو خط برسد.",
  }));

  const languages = Array.from({ length: 8 }, (_, i) => ({
    id: id("lng"),
    name: `زبان ${i + 1}`,
    level: (i % 5) + 1,
  }));

  const certifications = Array.from({ length: 6 }, (_, i) => ({
    id: id("cert"),
    name: `گواهینامهٔ نمونه ${i + 1}`,
    issuer: "مؤسسهٔ صادرکننده",
    date: "2021-03-01",
  }));

  const now = new Date().toISOString();
  return {
    id: id("resume"),
    title: "رزومه نمونه",
    locale: "fa",
    templateId,
    theme: {
      themeId: "indigo",
      pageBackground: "theme",
      backgroundPattern: "blobs",
      backgroundIntensity: 0.7,
      dateCalendar: "jalali",
      columnIntensity: 1,
      fontFamily: "vazirmatn",
      fontScale: 1,
      lineHeight: 1.5,
      pageMargin: 16,
      sectionSpacing: 6,
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

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});

let allOk = true;
const consoleErrors = [];

for (const templateId of TEMPLATES) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  page.on("pageerror", (err) => consoleErrors.push(`${templateId}: ${err}`));
  const data = buildWorstCase(templateId);
  await page.addInitScript((payload) => {
    window.__RESUME_DATA__ = payload;
  }, data);
  await page.goto(`${BASE_URL}/print`, { waitUntil: "networkidle" });
  try {
    await page.waitForSelector('[data-pdf-ready="true"]', { timeout: 20000 });
  } catch {
    console.log(`FAIL ${templateId}: /print never became ready`);
    allOk = false;
    await page.close();
    continue;
  }
  // Match the PDF pipeline: print media hides the .no-print editor chrome.
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(300);

  const report = await page.evaluate(
    ({ a4h, tol }) => {
      const pages = [...document.querySelectorAll(".a4-page")];
      return pages.map((pageEl) => {
        const pr = pageEl.getBoundingClientRect();
        let maxBottom = pr.top;
        let offender = null;
        for (const el of pageEl.querySelectorAll("*")) {
          if (el.closest(".no-print")) continue;
          // The decorative background SVG is clipped by the page (overflow:hidden);
          // its shapes legitimately extend past the frame, so never count them.
          if (el.closest("[data-rz-decorations]")) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          if (r.bottom > maxBottom) {
            maxBottom = r.bottom;
            offender = `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 40)}`;
          }
        }
        return {
          heightPx: +pr.height.toFixed(1),
          grewPastA4: pr.height > a4h + tol,
          overflowPx: +Math.max(0, maxBottom - pr.bottom).toFixed(1),
          offender,
        };
      });
    },
    { a4h: A4_H_PX, tol: TOLERANCE_PX },
  );

  const pageCount = report.length;
  const grew = report.some((p) => p.grewPastA4);
  const worstPage = report.reduce((a, b) => (b.overflowPx > a.overflowPx ? b : a), report[0]);
  const worstOverflow = worstPage.overflowPx;
  const ok = pageCount >= 2 && !grew && worstOverflow <= 6;
  if (!ok) allOk = false;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${templateId.padEnd(28)} pages=${pageCount} ` +
      `grewPastA4=${grew} worstOverflow=${worstOverflow}px` +
      (worstOverflow > 6 ? ` offender=${worstPage.offender}` : ""),
  );
  if (!ok && process.env.DEBUG_PAG) {
    console.log("   perPage:", report.map((p, i) => `p${i}=${p.overflowPx}`).join(" "));
  }
  await page.close();
}

console.log("\nCONSOLE_ERRORS:", JSON.stringify(consoleErrors, null, 2));
console.log(`\nOVERALL: ${allOk ? "PASS — every template paginates into true A4 pages" : "FAIL"}`);
await browser.close();
process.exit(allOk ? 0 : 1);
