// Session-2 verification: asserts the item 3/5/6/7 invariants on the live editor
// and captures a zoomed screenshot of the Experience + Education sections.
// Requires the dev server on http://localhost:3000.  node scripts/verify-session2.mjs
import { chromium } from "playwright-core";

const ACCENT = "#2563eb"; // vivid custom resume accent so item-7 colors are unambiguous
const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });

const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const LONG =
  "یک مسئولیت بسیار طولانی که قطعاً به چند خط می‌رسد تا رشد خودکار ارتفاع کادر متن بدون نوار اسکرول داخلی بررسی شود و مطمئن شویم متن کامل نمایش داده می‌شود و چیزی بریده نمی‌شود و این جمله را آن‌قدر ادامه می‌دهیم که به‌طور قطع از دو خط فراتر برود و چندین خط کامل را پر کند تا رشد ارتفاع به‌روشنی دیده شود.";

const resume = {
  id: id("resume"),
  title: "verify",
  locale: "fa",
  templateId: "professional-single-column",
  theme: {
    themeId: "sage",
    customColor: ACCENT,
    pageBackground: "white",
    backgroundPattern: "none",
    fontFamily: "vazirmatn",
    fontScale: 1,
    lineHeight: 1.5,
    pageMargin: 16,
    sectionSpacing: 6,
  },
  sections: [
    { id: id("sec"), type: "experience", title: "experience", visible: true, direction: "rtl", order: 0 },
    { id: id("sec"), type: "education", title: "education", visible: true, direction: "rtl", order: 1 },
  ],
  personalInfo: {
    fullName: "سارا احمدی",
    jobTitle: "مهندس نرم‌افزار ارشد",
    phone: "", location: "", email: "", dateOfBirth: "", nationality: "",
    links: [], profileImage: null, uppercaseName: false, photoStyle: "round",
    fieldVisibility: { jobTitle: true, phone: false, links: false, email: false, location: false, photo: false, dateOfBirth: false, nationality: false },
  },
  summary: { html: "" },
  experience: [
    {
      id: id("exp"), jobTitle: "مهندس فرانت‌اند", companyName: "شرکت نمونه فناوری",
      period: { start: "۱۳۹۸", end: "۱۴۰۲", current: false }, city: "تهران",
      projectLink: "", projectDescription: LONG,
      responsibilities: [{ id: id("r"), text: LONG }, { id: id("r"), text: "مسئولیت کوتاه." }],
    },
  ],
  skills: [],
  education: [
    {
      id: id("edu"), degree: "کارشناسی ارشد مهندسی نرم‌افزار", university: "دانشگاه نمونه تهران",
      startDate: "۱۳۹۴", endDate: "۱۳۹۸", gpa: "۱۸/۵", achievements: LONG, city: "تهران",
    },
  ],
  projects: [], languages: [], certifications: [],
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

await page.goto("http://localhost:3000", { waitUntil: "load" });
await page.evaluate((data) => localStorage.setItem("ai-res:resume", JSON.stringify(data)), resume);
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector(".a4-page");
await page.waitForTimeout(700);

const report = await page.evaluate((accentHex) => {
  const hexToRgb = (h) => {
    const n = parseInt(h.replace("#", ""), 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  };
  const accentRgb = hexToRgb(accentHex);

  // (A) No multiline textarea scrolls: content height must equal box height.
  const textareas = [...document.querySelectorAll(".a4-page textarea")];
  const diag = textareas.map((t) => ({
    len: t.value.length,
    scrollH: t.scrollHeight,
    clientH: t.clientHeight,
    styleH: t.style.height,
    overflowY: getComputedStyle(t).overflowY,
  }));
  const scrollers = diag.filter((t) => t.scrollH - t.clientH > 2 || t.overflowY !== "hidden");
  // A genuinely multi-line field (the long ones) must grow past the 2-row (~36px)
  // minimum without scrolling — proving auto-grow rather than clip/scroll.
  const tallEnough = diag.filter((t) => t.len > 200 && t.clientH > 40);

  // (C) Secondary titles use the resume accent.
  const valueColor = (val) => {
    const el = [...document.querySelectorAll(".a4-page input, .a4-page textarea")].find(
      (e) => e.value === val,
    );
    return el ? getComputedStyle(el).color : null;
  };

  // (B) Timeline rail line is visibly tall.
  const rails = [...document.querySelectorAll('[data-testid="timeline-rail-line"]')].map(
    (r) => Math.round(r.getBoundingClientRect().height),
  );

  return {
    textareaCount: textareas.length,
    diag,
    tallEnoughCount: tallEnough.length,
    scrollers,
    accentRgb,
    jobTitleColor: valueColor("مهندس نرم‌افزار ارشد"),
    companyColor: valueColor("شرکت نمونه فناوری"),
    universityColor: valueColor("دانشگاه نمونه تهران"),
    railHeights: rails,
  };
}, ACCENT);

const pass = {
  noScroll: report.scrollers.length === 0,
  grew: report.tallEnoughCount >= 3,
  jobTitleAccent: report.jobTitleColor === report.accentRgb,
  companyAccent: report.companyColor === report.accentRgb,
  universityAccent: report.universityColor === report.accentRgb,
  railsVisible: report.railHeights.length >= 2 && report.railHeights.every((h) => h > 30),
};

console.log(JSON.stringify({ report, pass }, null, 2));

// Capture the Education block on its own to confirm it mirrors Experience.
const eduBlock = page.locator('[data-block-kind="educationItem"]').first();
await eduBlock.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await eduBlock.screenshot({ path: "scripts/s2v-education.png" });

// Zoomed capture of the two sections for the visual checks (rail + education==experience).
await page.evaluate(() => {
  const page0 = document.querySelector(".a4-page");
  if (page0) page0.style.transform = "scale(1.6)";
  if (page0) page0.style.transformOrigin = "top right";
});
await page.waitForTimeout(200);
await page.screenshot({ path: "scripts/s2v-experience-education.png" });

console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors));
const allPass = Object.values(pass).every(Boolean) && consoleErrors.length === 0;
console.log("OVERALL:", allPass ? "PASS" : "FAIL");
await browser.close();
process.exit(allPass ? 0 : 1);
