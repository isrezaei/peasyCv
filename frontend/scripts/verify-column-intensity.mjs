// Focused end-to-end check for the column-colour-intensity adaptive text switch.
// Seeds the app (same localStorage path as verify-new-templates.mjs), renders the
// coloured-column templates at both ends of the intensity slider, and asserts on
// the REAL computed colours: the column bg tracks the slider, dark surfaces get
// white text + semi-transparent-white placeholders, light surfaces keep the
// accent family and the default placeholder.  node scripts/_verify-column-intensity.mjs
import { chromium } from "playwright-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";

const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const section = (type, title, order) => ({
  id: id("s"), type, title, visible: true, direction: "rtl", order,
  languageMeterVariant: "bars", languageShowMeter: true, languageShowLevelText: true,
  showMonth: true, monthFormat: "name",
  achievementShowDescription: true, achievementShowIcons: true,
});

function resume(templateId, themeId, columnIntensity) {
  return {
    id: id("resume"), title: "verify", locale: "fa", templateId,
    theme: {
      themeId, pageBackground: "theme", backgroundPattern: "none",
      backgroundIntensity: 0.7, dateCalendar: "jalali", fontFamily: "vazirmatn",
      fontScale: 1, lineHeight: 1.5, pageMargin: 16, sectionSpacing: 6,
      columnIntensity, showSectionIcons: false, atsMode: false,
    },
    sections: [
      section("summary", "درباره من", 0),
      section("experience", "تجربه کاری", 1),
      section("skills", "مهارت‌ها", 2),
      section("languages", "زبان‌ها", 3),
      section("achievements", "دستاوردها", 4),
    ],
    personalInfo: {
      fullName: "سارا احمدی", jobTitle: "مدیر ارشد محصول", phone: "۰۹۱۲۳۴۵۶۷۸۹",
      location: "تهران", email: "sara@example.com", dateOfBirth: "", nationality: "",
      links: [], profileImage: null, uppercaseName: false, photoStyle: "round", imageSide: "left",
      fieldVisibility: { jobTitle: true, phone: true, links: false, email: true, location: false, photo: false, dateOfBirth: false, nationality: false },
    },
    summary: { html: "<p>خلاصه.</p>" },
    experience: [{
      id: id("exp"), jobTitle: "عنوان", companyName: "شرکت",
      period: { start: "۱۳۹۷", end: "۱۴۰۰", current: false }, city: "تهران",
      projectLink: "", projectDescription: "شرح.", link: "", linkVisible: true,
      responsibilities: [{ id: id("r"), text: "مسئولیت." }],
    }],
    skills: [{ id: id("sk"), name: "فنی", skills: [{ id: id("k"), name: "اسکرام" }] }],
    education: [], projects: [],
    languages: [{ id: id("lang"), name: "فارسی", level: 5, showBars: true, showLevelText: true }],
    certifications: [],
    achievements: [{ id: id("a"), title: "", description: "" }], // empty -> placeholder visible in the column
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

// Expected column bg, mirroring resolveTheme math (verification only).
const hexToRgb = (hex) => { const n = hex.replace("#", ""); const i = parseInt(n, 16); return [(i >> 16) & 255, (i >> 8) & 255, i & 255]; };
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const rgb = (r, g, b) => `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
const mixWhite = (hex, t) => { const [r, g, b] = hexToRgb(hex); return rgb(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t); };
const darkenRgb = (hex, t) => { const [r, g, b] = hexToRgb(hex); return rgb(r * (1 - t), g * (1 - t), b * (1 - t)); };
const tint = (hex, mix, k) => mixWhite(hex, Math.max(0, Math.min(1, 1 - (1 - mix) * k)));
const shade = (hex, d, k) => darkenRgb(hex, Math.max(0, Math.min(0.85, d * k)));
// Mirrors columnTint: hard dark switch above the 105% threshold.
const colTint = (hex, mix, k) => (k > 1.05 + 1e-6 ? shade(hex, 0.5, k) : tint(hex, mix, k));

const PRESET = {
  indigo: { base: "#C2C4EF", accent: "#5B5BD6", vivid: false },
  greenBlue: { base: "#9FCFEB", accent: "#3DB86E", vivid: true },
};

// [template, themeId, intensity, expected bg fn, expectation]
const CASES = [
  ["aside-dark",  "indigo",    1.0, (p, k) => shade(p.accent, 0.5, k), "dark"],
  ["aside-dark",  "indigo",    2.0, (p, k) => shade(p.accent, 0.5, k), "dark"],  // extended range
  ["aside-dark",  "greenBlue", 0.5, (p, k) => shade(p.accent, 0.5, k), "light"], // light shade -> accent family restored
  ["aside-dark",  "greenBlue", 0.6, (p, k) => shade(p.accent, 0.5, k), "dark"],  // borderline band -> full-strength white
  // The 105% hard switch: at the threshold the light tint is untouched; one
  // slider stop above it the column jumps to the dark shade + on-dark tokens.
  ["sidebar-column", "indigo", 1.05, (p, k) => colTint(p.base, 0.45, k), "light"],
  ["sidebar-column", "indigo", 1.10, (p, k) => colTint(p.base, 0.45, k), "dark"],
  ["sidebar-column", "indigo", 2.0,  (p, k) => colTint(p.base, 0.45, k), "dark"],
  ["aside-photo", "indigo",    0.5, (p, k) => colTint(p.base, 0.5, k), "light"],
  ["aside-photo", "indigo",    1.5, (p, k) => colTint(p.base, 0.5, k), "dark"],
  ["sidebar-column", "greenBlue", 1.05, (p, k) => colTint(p.base, 0.45, k), "light"],
  ["sidebar-column", "greenBlue", 2.0,  (p, k) => colTint(p.base, 0.45, k), "dark"],
];

const LABEL = {
  "aside-dark": "ستون کناری تیره",
  "aside-photo": "ستون عکس کناری",
  "sidebar-column": "ستون رنگی کناری",
};

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(BASE, { waitUntil: "load" });

let fails = 0;
for (const [tid, themeId, k, bgOf, expect] of CASES) {
  await page.evaluate((data) => localStorage.setItem("ai-res:resume", JSON.stringify(data)), resume(tid, themeId, k));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".a4-page");
  await page.waitForTimeout(400);

  const expectedBg = bgOf(PRESET[themeId], k);
  const info = await page.evaluate((wantBg) => {
    const col = [...document.querySelectorAll(".a4-page div")].find(
      (d) => getComputedStyle(d).backgroundColor === wantBg && d.style.getPropertyValue("--rz-secondary"),
    );
    if (!col) return null;
    const h2 = col.querySelector("h2");
    return {
      heading: h2 ? getComputedStyle(h2).color : null,
      bodyColor: getComputedStyle(col).color,
      placeholderVar: col.style.getPropertyValue("--rz-placeholder") || "(unset)",
      secondaryVar: col.style.getPropertyValue("--rz-secondary"),
    };
  }, expectedBg);

  let ok = false, note = "";
  if (!info) {
    note = `no column with bg ${expectedBg} found (slider not applied?)`;
  } else if (expect === "dark") {
    ok =
      info.secondaryVar.trim() === "#FFFFFF" &&
      info.placeholderVar.includes("255,255,255") &&
      (info.heading === null || info.heading === "rgb(255, 255, 255)");
    note = JSON.stringify(info);
  } else {
    ok =
      info.secondaryVar.trim() !== "#FFFFFF" &&
      !info.placeholderVar.includes("255,255,255");
    note = JSON.stringify(info);
  }
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}: ${tid}/${themeId}@${k} expect=${expect} bg=${expectedBg} — ${note}`);
}

console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors));
const allPass = fails === 0 && consoleErrors.length === 0;
console.log("OVERALL:", allPass ? "PASS" : "FAIL");
await browser.close();
process.exit(allPass ? 0 : 1);
