// Full verification matrix for the timeline-panel corrective pass:
//   volumes (empty / one-page / heavy), theme sweep, pattern confinement,
//   column-width scaling, /print surface, other-template sanity, backend PDF.
//   node scripts/verify-timeline-matrix.mjs
import { chromium } from "playwright-core";
import { createPdfClient } from "./backend-api.mjs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";
const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

const section = (type, title, order, extra = {}) => ({
  id: id("s"), type, title, visible: true, direction: "rtl", order,
  languageMeterVariant: "bars", languageShowMeter: false, languageShowLevelText: true,
  showMonth: false, monthFormat: "name",
  achievementShowDescription: false, achievementShowIcons: false,
  skillDisplayMode: "list", skillShowLevel: false, skillMeterVariant: "bars",
  ...extra,
});
const exp = (jobTitle, companyName, start, end, current, bullets, descr = "") => ({
  id: id("exp"), jobTitle, companyName, period: { start, end, current }, city: "",
  projectLink: "", projectDescription: descr, link: "", linkVisible: false,
  responsibilities: bullets.map((text) => ({ id: id("r"), text })),
});
const theme = (over = {}) => ({
  themeId: "peach", pageBackground: "white", backgroundPattern: "none",
  backgroundIntensity: 0.7, dateCalendar: "jalali", fontFamily: "vazirmatn",
  fontScale: 1, lineHeight: 1.5, pageMargin: 16, sectionSpacing: 6,
  columnIntensity: 1, columnWidth: "medium",
  showSectionIcons: false, showSectionSeparators: false, atsMode: false,
  ...over,
});
const personal = (over = {}) => ({
  fullName: "محمدحسین رضایی", jobTitle: "توسعه‌دهندهٔ وب",
  phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹", location: "تهران، ایران", email: "rezaei.dev@gmail.com",
  dateOfBirth: "", nationality: "", militaryService: "",
  links: [{ id: id("l"), label: "rezaei.dev", url: "https://rezaei.dev" }],
  profileImage: null, uppercaseName: false, photoStyle: "round", imageSide: "left",
  fieldVisibility: { jobTitle: true, phone: true, links: true, email: true, location: true, photo: true, dateOfBirth: false, nationality: false, militaryService: false },
  ...over,
});
const base = (over = {}) => ({
  id: id("resume"), title: "matrix", locale: "fa", templateId: "timeline-panel",
  occupationCategory: "software-it",
  theme: theme(over.theme), sections: over.sections,
  personalInfo: personal(), summary: over.summary ?? { html: "" },
  experience: over.experience ?? [], skills: over.skills ?? [],
  education: over.education ?? [], projects: over.projects ?? [],
  languages: over.languages ?? [], certifications: over.certifications ?? [],
  achievements: over.achievements ?? [],
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});

const ALL_SECTIONS = () => [
  section("summary", "دربارهٔ من", 0), section("experience", "تجربهٔ کاری", 1),
  section("projects", "پروژه‌ها", 2), section("achievements", "دستاوردها", 3),
  section("certifications", "گواهی‌نامه‌ها", 4), section("education", "تحصیلات", 5),
  section("languages", "زبان‌ها", 6), section("skills", "مهارت‌ها", 7),
];

const LONG_BULLET = "طراحی و پیاده‌سازی معماری میکروفرانت‌اند برای پنج تیم محصول با تمرکز بر کارایی، تحویل مستقل و پایداری بلندمدت زیرساخت مشترک سازمان.";

function emptyResume() {
  return base({
    sections: ALL_SECTIONS(),
    experience: [exp("", "", "", "", false, [""])],
    skills: [{ id: id("sk"), name: "", showTitle: false, skills: [{ id: id("k"), name: "", level: 3 }] }],
    education: [{ id: id("edu"), degree: "", university: "", startDate: "", endDate: "", gpa: "", achievements: "", city: "" }],
    projects: [{ id: id("p"), name: "", role: "", link: "", linkVisible: false, description: "" }],
    languages: [{ id: id("lang"), name: "", level: 3, showBars: false, showLevelText: true }],
    certifications: [{ id: id("c"), name: "", issuer: "", date: "" }],
    achievements: [],
  });
}
function onePageResume() {
  return base({
    sections: ALL_SECTIONS(),
    summary: { html: "<p>توسعه‌دهندهٔ وب حرفه‌ای با بیش از ۵ سال تجربه در طراحی و ساخت رابط‌های کاربری مدرن، سریع و مقیاس‌پذیر.</p>" },
    experience: [
      exp("توسعه‌دهندهٔ ارشد فرانت‌اند", "شرکت فناوری آسا", "2023-06-01", "", true,
        ["رهبری بازطراحی کامل داشبورد سازمانی با React و TypeScript", "کاهش زمان بارگذاری تا ۴۰٪ با بهینه‌سازی رندر"], "رهبری فنی تیم پنج‌نفره فرانت‌اند."),
      exp("توسعه‌دهندهٔ فرانت‌اند", "استارتاپ دیجی‌پی", "2021-06-01", "2023-06-01", false,
        ["توسعهٔ پنل کاربری و درگاه پرداخت با Next.js", "افزودن آزمون واحد و افزایش پوشش تست تا ۸۰٪"], "توسعهٔ محصول پرداخت."),
    ],
    skills: [{ id: id("sk"), name: "", showTitle: false, skills: ["React", "TypeScript", "Next.js", "Git"].map((n) => ({ id: id("k"), name: n, level: 4 })) }],
    education: [{ id: id("edu"), degree: "کارشناسی مهندسی کامپیوتر", university: "دانشگاه تهران", startDate: "2017-09-01", endDate: "2021-06-01", gpa: "۱۷٫۵", achievements: "رتبهٔ برتر دوره", city: "تهران" }],
    projects: [
      { id: id("p"), name: "سامانهٔ مدیریت وظایف", role: "", link: "https://taskly.app", linkVisible: true, description: "اپ مدیریت پروژه با React و Node.js." },
      { id: id("p"), name: "وب‌سایت شخصی", role: "", link: "https://rezaei.dev", linkVisible: true, description: "ساخته‌شده با Next.js." },
    ],
    languages: [
      { id: id("lang"), name: "فارسی", level: 5, showBars: false, showLevelText: true },
      { id: id("lang"), name: "انگلیسی", level: 4, showBars: false, showLevelText: true },
    ],
    certifications: [{ id: id("c"), name: "توسعهٔ حرفه‌ای React", issuer: "Frontend Masters", date: "2022-06-01" }],
    achievements: [{ id: id("a"), title: "بهبود ۴۰٪ سرعت بارگذاری اپلیکیشن اصلی سازمان.", description: "" }],
  });
}
function heavyResume() {
  return base({
    sections: ALL_SECTIONS(),
    summary: { html: `<p>${LONG_BULLET} ${LONG_BULLET}</p>` },
    experience: Array.from({ length: 8 }, (_, i) =>
      exp(`توسعه‌دهندهٔ ارشد شمارهٔ ${i + 1} با عنوان شغلی نسبتاً طولانی`, `شرکت فناوری اطلاعات و ارتباطات پیشرو خاورمیانه ${i + 1}`,
        "2019-06-01", i === 0 ? "" : "2023-06-01", i === 0,
        Array.from({ length: 5 }, (_, j) => `${LONG_BULLET.slice(0, 80)} (${j + 1})`), LONG_BULLET)),
    skills: [{ id: id("sk"), name: "", showTitle: false, skills: [
      "React", "TypeScript", "Next.js", "Node.js", "HTML / CSS", "Tailwind", "Git", "Redux", "Docker", "Figma",
      "GraphQL", "PostgreSQL", "Kubernetes", "Playwright", "Storybook", "WebAssembly and Performance Profiling", "Accessibility (WCAG)", "CI/CD"
    ].map((n) => ({ id: id("k"), name: n, level: 4 })) }],
    education: Array.from({ length: 4 }, (_, i) => ({
      id: id("edu"), degree: `کارشناسی ارشد مهندسی نرم‌افزار و سیستم‌های توزیع‌شده ${i + 1}`,
      university: "دانشگاه صنعتی امیرکبیر — پردیس بین‌المللی کیش", startDate: "2015-09-01", endDate: "2018-06-01",
      gpa: "۱۸٫۲۵", achievements: "پژوهش در حوزهٔ سیستم‌های توزیع‌شده و انتشار دو مقالهٔ علمی‌پژوهشی.", city: "تهران",
    })),
    projects: Array.from({ length: 6 }, (_, i) => ({
      id: id("p"), name: `پروژهٔ متن‌باز شمارهٔ ${i + 1}`, role: "", link: "https://github.com/mhrezaei/very-long-repository-name-example", linkVisible: true,
      description: "کتابخانهٔ کامپوننت متن‌باز با مستندات کامل، آزمون‌های خودکار و انتشار مستمر روی npm.",
    })),
    languages: ["فارسی", "انگلیسی", "آلمانی", "فرانسوی", "عربی", "ترکی استانبولی"].map((n, i) => ({
      id: id("lang"), name: n, level: ((5 - (i % 4))), showBars: false, showLevelText: true,
    })),
    certifications: Array.from({ length: 6 }, (_, i) => ({
      id: id("c"), name: `گواهینامهٔ حرفه‌ای معماری نرم‌افزار سطح ${i + 1}`, issuer: "مؤسسهٔ بین‌المللی آموزش‌های تخصصی", date: "2021-06-01",
    })),
    achievements: Array.from({ length: 8 }, (_, i) => ({
      id: id("a"), title: `${LONG_BULLET.slice(0, 90)} — دستاورد ${i + 1}`, description: "",
    })),
  });
}

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

const results = [];
const record = (name, ok, extra = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${extra ? " — " + extra : ""}`);
};

async function seed(resume) {
  await page.evaluate((data) => {
    localStorage.clear();
    localStorage.setItem("ai-res:occupation-category", JSON.stringify({ id: "software-it", explicit: true }));
    localStorage.setItem("ai-res:resume", JSON.stringify(data));
  }, resume);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".a4-page");
  await page.waitForTimeout(700);
}

// Leaf-ink page metrics: per page, the main column's content bottom gap, panel
// gap, horizontal overflow of the page, and pattern confinement.
async function pageMetrics() {
  return page.evaluate(() => {
    const PXMM = 96 / 25.4;
    const mm = (px) => +(px / PXMM).toFixed(1);
    return [...document.querySelectorAll(".a4-page")].map((pg) => {
      const pr = pg.getBoundingClientRect();
      const panel = [...pg.querySelectorAll("div")].find((d) => {
        const cs = getComputedStyle(d);
        return cs.borderRadius === "15px" && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && d.getBoundingClientRect().height > 100;
      });
      const panelRect = panel ? panel.getBoundingClientRect() : null;
      let mainBottom = pr.top;
      let panelBottom = panelRect ? panelRect.top : pr.top;
      const leaves = pg.querySelectorAll("*");
      for (const el of leaves) {
        if (el.children.length > 0 && !el.matches("input, svg")) continue;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (el.closest(".no-print")) continue;
        const r = el.getBoundingClientRect();
        if (r.height === 0 || r.width === 0) continue;
        const text = (el.textContent ?? "").trim();
        const isInput = el.matches("input, [contenteditable]");
        const ink = text.length > 0 || isInput || el.matches("svg, img");
        if (!ink) continue;
        const inPanel = panel && panel.contains(el);
        if (inPanel) { if (r.bottom > panelBottom) panelBottom = r.bottom; }
        else if (r.bottom > mainBottom) mainBottom = r.bottom;
      }
      const patternSvgs = [...pg.querySelectorAll("svg")].filter((s) => ["0 0 210 297", "0 0 64 320"].includes(s.getAttribute("viewBox")));
      const patternsOutsidePanel = patternSvgs.filter((s) => !(panel && panel.contains(s))).length;
      return {
        mainGapMm: mm(pr.bottom - mainBottom),
        panelContentGapMm: panelRect ? mm(pr.bottom - panelBottom) : null,
        panelCardGapMm: panelRect ? mm(pr.bottom - panelRect.bottom) : null,
        panelBg: panel ? getComputedStyle(panel).backgroundColor : null,
        hOverflow: pg.scrollWidth - pg.clientWidth,
        patternSvgs: patternSvgs.length,
        patternsOutsidePanel,
      };
    });
  });
}

await page.goto(BASE, { waitUntil: "load" });

// ── 1) Volumes ───────────────────────────────────────────────────────────────
for (const [label, resume, expectPages] of [
  ["empty", emptyResume(), [1, 1]],
  ["one-page", onePageResume(), [1, 2]],
  ["heavy", heavyResume(), [3, 6]],
]) {
  await seed(resume);
  const metrics = await pageMetrics();
  const n = metrics.length;
  const inRange = n >= expectPages[0] && n <= expectPages[1];
  // No page may paint main-column ink into the 6.35mm bottom margin (allow 1mm
  // rasterization slack); non-final pages must fill — leftover below the last
  // main block stays under one whole-entry block (~80mm for the heavy fixture's
  // 5-bullet entries; blocks only split when taller than a full page).
  const noOverflow = metrics.every((m) => m.mainGapMm >= 5.3 && m.hOverflow <= 1);
  const filled = metrics.slice(0, -1).every((m) => m.mainGapMm <= 80);
  record(`volume ${label}: pages=${n}`, inRange && noOverflow && filled, JSON.stringify(metrics));
  for (let i = 0; i < n; i++) await page.locator(".a4-page").nth(i).screenshot({ path: `scripts/tpm-${label}-p${i + 1}.png` });
}

// ── 2) Theme sweep (light lock + harmony) ────────────────────────────────────
const themes = ["peach", "sage", "lavender", "skyBlue", "dustyRose", "grey", "navyGold", "crimsonCopper"];
for (const tid of themes) {
  const r = onePageResume(); r.theme = theme({ themeId: tid, backgroundPattern: "none" });
  await seed(r);
  const check = await page.evaluate(() => {
    const lum = (rgbStr) => {
      const [r, g, b] = rgbStr.match(/\d+/g).map(Number);
      const c = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
    };
    const pg = document.querySelector(".a4-page");
    const pageBg = getComputedStyle(pg).backgroundColor;
    const panel = [...pg.querySelectorAll("div")].find((d) => {
      const cs = getComputedStyle(d);
      return cs.borderRadius === "15px" && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && d.getBoundingClientRect().height > 100;
    });
    const panelBg = getComputedStyle(panel).backgroundColor;
    const h2 = [...panel.querySelectorAll("h2")][0];
    const h2c = h2 ? getComputedStyle(h2).color : null;
    const contrast = h2c ? (() => { const a = lum(panelBg) + 0.05, b = lum(h2c) + 0.05; return +(Math.max(a, b) / Math.min(a, b)).toFixed(2); })() : null;
    return { pageBg, panelLum: +lum(panelBg).toFixed(3), contrast };
  });
  const ok = check.pageBg === "rgb(255, 255, 255)" && check.panelLum >= 0.58 && (check.contrast ?? 5) >= 4.5;
  record(`theme ${tid}`, ok, JSON.stringify(check));
}
await page.locator(".a4-page").first().screenshot({ path: "scripts/tpm-theme-crimson.png" });

// ── 3) Pattern confinement ───────────────────────────────────────────────────
for (const pat of ["blobs", "botanical", "dotGrid"]) {
  const r = onePageResume(); r.theme = theme({ backgroundPattern: pat, backgroundIntensity: 1.0 });
  await seed(r);
  const metrics = await pageMetrics();
  const ok = metrics.every((m) => m.patternsOutsidePanel === 0) && metrics.some((m) => m.patternSvgs > 0);
  record(`pattern ${pat} confined to panel`, ok, JSON.stringify(metrics.map((m) => [m.patternSvgs, m.patternsOutsidePanel])));
}
await page.locator(".a4-page").first().screenshot({ path: "scripts/tpm-pattern.png" });

// ── 4) Column-width scaling ──────────────────────────────────────────────────
for (const cw of ["small", "medium", "xlarge"]) {
  const r = heavyResume(); r.theme = theme({ columnWidth: cw });
  await seed(r);
  const scale = await page.evaluate(() => {
    const panel = [...document.querySelectorAll(".a4-page div")].find((d) => {
      const cs = getComputedStyle(d);
      return cs.borderRadius === "15px" && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && d.getBoundingClientRect().height > 100;
    });
    const clipped = [...panel.querySelectorAll("input")].filter((el) => {
      if (el.scrollWidth > el.clientWidth + 1) {
        const cs = getComputedStyle(el);
        return cs.textOverflow !== "ellipsis"; // hard clip (no ellipsis) = failure
      }
      return false;
    });
    return {
      widthMm: +(panel.getBoundingClientRect().width / (96 / 25.4)).toFixed(1),
      fontSizePx: +parseFloat(getComputedStyle(panel).fontSize).toFixed(2),
      hardClipped: clipped.length,
      sample: clipped.slice(0, 3).map((c) => c.value.slice(0, 25)),
    };
  });
  record(`columnWidth ${cw}`, scale.hardClipped === 0, JSON.stringify(scale));
  await page.locator(".a4-page").first().screenshot({ path: `scripts/tpm-cw-${cw}.png` });
}

// ── 5) /print surface (the PDF source) — its own page so the init script
//       cannot leak into later editor steps ─────────────────────────────────
{
  const printPage = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
  const r = onePageResume();
  r.theme = theme({ backgroundPattern: "botanical", backgroundIntensity: 1.0 });
  await printPage.addInitScript((data) => { window.__RESUME_DATA__ = data; }, r);
  await printPage.goto(`${BASE}/print`, { waitUntil: "networkidle" });
  await printPage.waitForSelector(".a4-page");
  await printPage.waitForTimeout(900);
  const metrics = await printPage.evaluate(() => {
    const PXMM = 96 / 25.4;
    const mm = (px) => +(px / PXMM).toFixed(1);
    return [...document.querySelectorAll(".a4-page")].map((pg) => {
      const pr = pg.getBoundingClientRect();
      const panel = [...pg.querySelectorAll("div")].find((d) => {
        const cs = getComputedStyle(d);
        return cs.borderRadius === "15px" && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && d.getBoundingClientRect().height > 100;
      });
      const patternSvgs = [...pg.querySelectorAll("svg")].filter((s) => ["0 0 210 297", "0 0 64 320"].includes(s.getAttribute("viewBox")));
      let mainBottom = pr.top;
      for (const el of pg.querySelectorAll("*")) {
        if (el.children.length > 0 && !el.matches("svg")) continue;
        const r2 = el.getBoundingClientRect();
        if (r2.height === 0 || (el.textContent ?? "").trim().length === 0) continue;
        if (panel && panel.contains(el)) continue;
        if (r2.bottom > mainBottom) mainBottom = r2.bottom;
      }
      return {
        mainGapMm: mm(pr.bottom - mainBottom),
        hOverflow: pg.scrollWidth - pg.clientWidth,
        panelBg: panel ? getComputedStyle(panel).backgroundColor : null,
        panelCardGapMm: panel ? mm(pr.bottom - panel.getBoundingClientRect().bottom) : null,
        patternSvgs: patternSvgs.length,
        patternsOutsidePanel: patternSvgs.filter((s) => !(panel && panel.contains(s))).length,
      };
    });
  });
  const ok = metrics.every((m) => m.mainGapMm >= 5.3 && m.hOverflow <= 1 && m.patternsOutsidePanel === 0 && m.patternSvgs > 0);
  record("/print surface margins + pattern confinement", ok, JSON.stringify(metrics));
  for (let i = 0; i < metrics.length; i++) await printPage.locator(".a4-page").nth(i).screenshot({ path: `scripts/tpm-print-p${i + 1}.png` });
  await printPage.close();
}

// ── 6) Other templates sanity (isolation spot-check) ─────────────────────────
{
  const others = ["professional-single-column", "double-column", "sidebar-column", "header-band"];
  await page.goto(BASE, { waitUntil: "load" });
  for (const tid of others) {
    const r = onePageResume(); r.templateId = tid;
    const before = consoleErrors.length;
    await seed(r);
    const info = await page.evaluate(() => {
      const pg = document.querySelector(".a4-page");
      const h2 = pg.querySelector("h2");
      return {
        pages: document.querySelectorAll(".a4-page").length,
        h2Size: h2 ? getComputedStyle(h2).fontSize : null,
        hasName: [...pg.querySelectorAll("input")].some((i) => i.value === "محمدحسین رضایی"),
      };
    });
    record(`other template ${tid}`, info.pages >= 1 && info.hasName && consoleErrors.length === before, JSON.stringify(info));
    await page.locator(".a4-page").first().screenshot({ path: `scripts/tpm-other-${tid}.png` });
  }
}

// ── 7) Backend PDF ───────────────────────────────────────────────────────────
try {
  const pdfClient = await createPdfClient();
  for (const [label, r] of [["one-page", onePageResume()], ["heavy", heavyResume()]]) {
    const buf = await pdfClient.renderPdf(r);
    const head = buf.slice(0, 5).toString("latin1");
    const pageCount = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
    record(`PDF ${label}`, head === "%PDF-" && buf.length > 5000 && pageCount >= 1, `bytes=${buf.length} pages=${pageCount}`);
  }
} catch (e) {
  record("PDF export", false, e.message.split("\n")[0]);
}

console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors.slice(0, 10)));
const allPass = results.every((r) => r.ok);
console.log("OVERALL:", allPass ? "PASS" : "FAIL");
await browser.close();
process.exit(allPass ? 0 : 1);
