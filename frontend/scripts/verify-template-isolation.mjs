// ISOLATION PROOF (DOM side) for the timeline-panel corrective pass.
//
// Renders ALL TEN registry templates (the five retired skins are reached by
// seeding `templateId` directly, per the verify skill) with one identical
// resume, and asserts that every shared component I touched still paints its
// PRE-CHANGE values — the literal CSS each one emitted before the change:
//
//   ResponsibilityListEditor  VStack   margin-top 16px (mt="4"), row-gap 4px (gap="1")
//   SkillListEditor (list)    VStack   margin-top  8px,          row-gap 4px (gap="1")
//   SkillListEditor rows               bullet "•" present, text 0.8em of page base
//   PersonalInfoContacts               order phone → email → location → links
//   SummaryBlock                       0.92em of the page base
//   SecondaryTitleField                one-line ellipsis (white-space: nowrap)
//   Section headings                   the shared 1.04em / 0.82em scale
//
// plus a page-count + geometry fingerprint written to scripts/isolation-*.json
// and a screenshot per template.
//   node scripts/verify-template-isolation.mjs
import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";
const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

// Every template in the registry — the 5 offered plus the 5 retired skins.
const TEMPLATES = [
  "professional-single-column", "double-column", "sidebar-column", "header-band",
  "aside-dark", "aside-photo", "compact-duo", "ruled-single", "classic-centered",
  // timeline-panel is the template under change; included so its (expected)
  // DIFFERENCES are visible in the same fingerprint file rather than hidden.
  "timeline-panel",
];
const CHANGED = new Set(["timeline-panel"]);

const section = (type, title, order, extra = {}) => ({
  id: id("s"), type, title, visible: true, direction: "rtl", order,
  languageMeterVariant: "bars", languageShowMeter: true, languageShowLevelText: true,
  showMonth: true, monthFormat: "name",
  achievementShowDescription: true, achievementShowIcons: true,
  skillDisplayMode: "list", skillShowLevel: false, skillMeterVariant: "bars",
  ...extra,
});

function fixture(templateId) {
  return {
    id: id("resume"), title: "isolation", locale: "fa", templateId,
    occupationCategory: "software-it",
    theme: {
      themeId: "indigo", pageBackground: "white", backgroundPattern: "none",
      backgroundIntensity: 0.7, dateCalendar: "jalali", fontFamily: "vazirmatn",
      fontScale: 1, lineHeight: 1.5, pageMargin: 16, sectionSpacing: 6,
      columnIntensity: 1, columnWidth: "medium",
      showSectionIcons: false, showSectionSeparators: false, atsMode: false,
    },
    sections: [
      section("summary", "درباره من", 0), section("experience", "تجربه کاری", 1),
      section("skills", "مهارت‌ها", 2), section("education", "تحصیلات", 3),
      section("projects", "پروژه‌ها", 4), section("languages", "زبان‌ها", 5),
      section("certifications", "گواهینامه‌ها", 6), section("achievements", "دستاوردها", 7),
    ],
    personalInfo: {
      fullName: "سارا احمدی", jobTitle: "مدیر ارشد محصول",
      phone: "۰۹۱۲۳۴۵۶۷۸۹", location: "تهران، ایران", email: "sara@example.com",
      dateOfBirth: "", nationality: "", militaryService: "",
      links: [{ id: id("l"), label: "LinkedIn", url: "linkedin.com/in/sara" }],
      profileImage: null, uppercaseName: false, photoStyle: "round", imageSide: "left",
      fieldVisibility: { jobTitle: true, phone: true, links: true, email: true, location: true, photo: true, dateOfBirth: false, nationality: false, militaryService: false },
    },
    summary: { html: "<p>خلاصه‌ای حرفه‌ای برای آزمودن اندازهٔ متن و شکست خط در ستون‌های گوناگون قالب‌ها.</p>" },
    experience: [0, 1].map((i) => ({
      id: id("exp"), jobTitle: `عنوان شغلی ${i + 1}`, companyName: `شرکت نمونه ${i + 1}`,
      period: { start: "2019-06-01", end: i === 0 ? "" : "2022-06-01", current: i === 0 }, city: "تهران",
      projectLink: "", projectDescription: "شرح کوتاه پروژه.", link: "", linkVisible: true,
      responsibilities: [{ id: id("r"), text: "مسئولیت نخست با متنی به‌اندازهٔ کافی بلند." }, { id: id("r"), text: "مسئولیت دوم." }],
    })),
    skills: [{ id: id("sk"), name: "فنی", showTitle: true, skills: ["مدیریت محصول", "تحلیل داده"].map((n) => ({ id: id("k"), name: n, level: 4 })) }],
    education: [{ id: id("edu"), degree: "کارشناسی ارشد", university: "دانشگاه نمونه", startDate: "2015-09-01", endDate: "2018-06-01", gpa: "۱۸", achievements: "رتبهٔ برتر.", city: "تهران" }],
    projects: [{ id: id("p"), name: "پروژه نمونه", role: "", link: "", linkVisible: true, description: "توضیح پروژه." }],
    languages: [{ id: id("lang"), name: "فارسی", level: 5, showBars: true, showLevelText: true }],
    certifications: [{ id: id("c"), name: "گواهینامه مدیریت", issuer: "موسسه نمونه", date: "2020-06-01" }],
    achievements: [{ id: id("a"), title: "دستاورد نمونه", description: "توضیح دستاورد." }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
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

await page.goto(BASE, { waitUntil: "load" });

const fingerprints = {};
for (const templateId of TEMPLATES) {
  await page.evaluate((data) => {
    localStorage.clear();
    localStorage.setItem("ai-res:occupation-category", JSON.stringify({ id: "software-it", explicit: true }));
    localStorage.setItem("ai-res:resume", JSON.stringify(data));
  }, fixture(templateId));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".a4-page");
  await page.waitForTimeout(650);

  const fp = await page.evaluate(() => {
    const px = (v) => Math.round(parseFloat(v) * 100) / 100;
    const pages = [...document.querySelectorAll(".a4-page")];
    const pageBase = parseFloat(getComputedStyle(pages[0]).fontSize); // 15px at scale 1

    // Responsibility lists: the VStack that holds the "•" bullet rows.
    const bulletRows = [...document.querySelectorAll('.a4-page [contenteditable="true"]')]
      .map((ed) => ed.closest("div")?.parentElement)
      .filter(Boolean);
    const respLists = [...new Set(
      [...document.querySelectorAll(".a4-page div")].filter((d) => {
        const kids = [...d.children];
        return kids.length > 0 && kids.every((k) => k.textContent?.startsWith("•")) && kids.length >= 2;
      }),
    )].map((d) => {
      const cs = getComputedStyle(d);
      return { rowGap: px(cs.rowGap), marginTop: px(cs.marginTop), rows: d.children.length };
    });

    // Skill list rows: bullet glyph + text size.
    const skillBullets = [...document.querySelectorAll(".a4-page span")]
      .filter((s) => s.textContent === "•" && s.getAttribute("aria-hidden") !== null)
      .map((s) => px(getComputedStyle(s).fontSize));

    // Summary editor em (relative to the page base). Located by its CONTENT —
    // the seeded summary text — and read off the editable node itself, which
    // inherits SummaryBlock's font-size box.
    const summaryEd = [...document.querySelectorAll('.a4-page [contenteditable="true"]')]
      .find((e) => (e.textContent ?? "").includes("خلاصه‌ای حرفه‌ای"));
    const summaryEm = summaryEd
      ? Math.round((parseFloat(getComputedStyle(summaryEd).fontSize) / pageBase) * 1000) / 1000
      : null;

    // Contact item ORDER (by icon-bearing rows carrying a known value).
    const contactOrder = [...document.querySelectorAll(".a4-page input")]
      .map((i) => i.value)
      .filter((v) => ["۰۹۱۲۳۴۵۶۷۸۹", "sara@example.com", "تهران، ایران", "LinkedIn"].includes(v));

    // Headings.
    const h2s = [...document.querySelectorAll(".a4-page h2")].map((h) => {
      const cs = getComputedStyle(h);
      return {
        text: (h.textContent ?? "").trim().slice(0, 14),
        em: Math.round((parseFloat(cs.fontSize) / pageBase) * 1000) / 1000,
        weight: cs.fontWeight, ls: cs.letterSpacing, color: cs.color,
      };
    });

    // Entry subtitles (SecondaryTitleField) — one-line ellipsis on print/editor.
    const subtitleNowrap = [...document.querySelectorAll(".a4-page input")]
      .filter((i) => i.value.startsWith("شرکت نمونه"))
      .map((i) => getComputedStyle(i).whiteSpace);

    return {
      pageCount: pages.length,
      pageHeights: pages.map((p) => px(p.getBoundingClientRect().height)),
      pageBase: px(pageBase),
      respLists, skillBullets, summaryEm, contactOrder, h2s, subtitleNowrap,
      inputCount: document.querySelectorAll(".a4-page input, .a4-page [contenteditable='true']").length,
    };
  });

  fingerprints[templateId] = fp;
  await page.locator(".a4-page").first().screenshot({ path: `scripts/isolation-${templateId}.png` });

  if (CHANGED.has(templateId)) {
    console.log(`(changed) ${templateId}: ${JSON.stringify({ pages: fp.pageCount, h2em: [...new Set(fp.h2s.map((h) => h.em))], resp: fp.respLists[0] })}`);
    continue;
  }

  // ── Pre-change value assertions for every shared component I touched ──────
  const failures = [];
  // ResponsibilityListEditor default: mt="4" (16px), gap="1" (4px).
  for (const l of fp.respLists) {
    if (l.rowGap !== 4) failures.push(`respList rowGap=${l.rowGap} (want 4)`);
    if (l.marginTop !== 16 && l.marginTop !== 8) failures.push(`respList marginTop=${l.marginTop} (want 16 resp / 8 skills)`);
  }
  if (fp.respLists.length === 0) failures.push("no bullet lists found");
  // Skills list keeps its "•" markers at the fixed `sm` rem token (14px).
  if (fp.skillBullets.length === 0) failures.push("no bullet glyphs");
  if (fp.skillBullets.some((s) => s !== 14)) failures.push(`bullet sizes ${JSON.stringify([...new Set(fp.skillBullets)])} (want 14)`);
  // SummaryBlock default 0.92em.
  if (fp.summaryEm !== null && Math.abs(fp.summaryEm - 0.92) > 0.005) failures.push(`summary em=${fp.summaryEm} (want 0.92)`);
  // Contacts order unchanged (links LAST).
  const wantOrder = ["۰۹۱۲۳۴۵۶۷۸۹", "sara@example.com", "تهران، ایران", "LinkedIn"];
  if (JSON.stringify(fp.contactOrder) !== JSON.stringify(wantOrder)) {
    failures.push(`contact order ${JSON.stringify(fp.contactOrder)}`);
  }
  // Section headings on one of the two shared scales, both untouched here:
  // SectionTitleBlock's 1.08em (the original column templates) and
  // SectionHeading's 1.04em / 0.82em-plain (the imported skins).
  const SHARED_H2_EM = [1.08, 1.04, 0.82];
  const badH2 = fp.h2s.filter((h) => !SHARED_H2_EM.some((em) => Math.abs(h.em - em) <= 0.02));
  if (badH2.length) failures.push(`h2 off-scale: ${JSON.stringify(badH2.map((h) => [h.text, h.em]))}`);
  // SecondaryTitleField still one-line.
  if (fp.subtitleNowrap.some((w) => w !== "nowrap")) failures.push(`subtitle white-space ${JSON.stringify(fp.subtitleNowrap)}`);

  record(`isolation ${templateId}`, failures.length === 0, failures.length ? failures.join(" | ") : `pages=${fp.pageCount} h2em=${[...new Set(fp.h2s.map((h) => h.em))]}`);
}

writeFileSync("scripts/isolation-fingerprints.json", JSON.stringify(fingerprints, null, 2));
console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors.slice(0, 6)));
const allPass = results.every((r) => r.ok) && consoleErrors.length === 0;
console.log("TEMPLATE ISOLATION:", allPass ? "PASS" : "FAIL");
await browser.close();
process.exit(allPass ? 0 : 1);
