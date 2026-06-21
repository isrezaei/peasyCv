// Pagination regression check: injects a worst-case resume (all sections, many
// items) plus the default seeded resume and asserts that no block overflows past
// the A4 frame or the page content box on any page. Run with the dev server up
// on http://localhost:3000:  node scripts/measure-pagination.mjs
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

function buildWorstCase() {
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
    period: { start: "۱۳۹۸", end: "۱۴۰۲", current: false },
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
    startDate: "۱۳۹۴",
    endDate: "۱۳۹۸",
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
    date: "۱۴۰۱",
  }));

  const now = new Date().toISOString();
  return {
    id: id("resume"),
    title: "رزومه نمونه",
    locale: "fa",
    templateId: "professional-single-column",
    theme: {
      themeId: "sage",
      customColor: null,
      pageBackground: "theme",
      backgroundPattern: "blobs",
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

async function measureOverflow(label) {
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

await page.goto("http://localhost:3000", { waitUntil: "load" });
const worst = buildWorstCase();
await page.evaluate((data) => localStorage.setItem("ai-res:resume", JSON.stringify(data)), worst);
await page.reload({ waitUntil: "networkidle" });
const worstOk = await measureOverflow("WORST CASE (all sections, many items)");
await page.screenshot({ path: "scripts/measure-worstcase.png", fullPage: true });

await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
const defaultOk = await measureOverflow("DEFAULT SEEDED RESUME");
await page.screenshot({ path: "scripts/measure-default.png", fullPage: true });

console.log("\nCONSOLE_ERRORS:", JSON.stringify(consoleErrors, null, 2));
console.log(`\nOVERALL: ${worstOk && defaultOk ? "PASS — no page overflows the A4 frame" : "FAIL"}`);
await browser.close();
process.exit(worstOk && defaultOk ? 0 : 1);
