// COMPUTED-STYLE COMPARISON: the rendered timeline-panel vs the imported
// reference (`Resume.dc.html`, Claude Design 7d8d659d). Reference values are the
// file's own inline styles, transcribed here verbatim; measured values come out
// of the live DOM at font scale 1.0 (where the reference's px map 1:1 onto A4).
//   node scripts/verify-timeline-vs-reference.mjs
import { chromium } from "playwright-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";
const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

const section = (type, title, order) => ({
  id: id("s"), type, title, visible: true, direction: "rtl", order,
  languageMeterVariant: "bars", languageShowMeter: false, languageShowLevelText: true,
  showMonth: false, monthFormat: "name",
  achievementShowDescription: false, achievementShowIcons: false,
  skillDisplayMode: "list", skillShowLevel: false, skillMeterVariant: "bars",
});
const exp = (jobTitle, companyName, start, end, current, bullets) => ({
  id: id("exp"), jobTitle, companyName, period: { start, end, current }, city: "",
  projectLink: "", projectDescription: "", link: "", linkVisible: false,
  responsibilities: bullets.map((text) => ({ id: id("r"), text })),
});

const resume = {
  id: id("resume"), title: "ref", locale: "fa", templateId: "timeline-panel",
  occupationCategory: "software-it",
  theme: {
    themeId: "peach", pageBackground: "white", backgroundPattern: "none",
    backgroundIntensity: 0.7, dateCalendar: "jalali", fontFamily: "vazirmatn",
    fontScale: 1, lineHeight: 1.5, pageMargin: 16, sectionSpacing: 6,
    columnIntensity: 1, columnWidth: "medium",
    showSectionIcons: false, showSectionSeparators: false, atsMode: false,
  },
  sections: [
    section("summary", "دربارهٔ من", 0), section("experience", "تجربهٔ کاری", 1),
    section("projects", "پروژه‌ها", 2), section("certifications", "گواهی‌نامه‌ها", 3),
    section("education", "تحصیلات", 4), section("languages", "زبان‌ها", 5),
    section("skills", "مهارت‌ها", 6),
  ],
  personalInfo: {
    fullName: "محمدحسین رضایی", jobTitle: "توسعه‌دهندهٔ وب",
    phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹", location: "تهران، ایران", email: "rezaei.dev@gmail.com",
    dateOfBirth: "", nationality: "", militaryService: "",
    links: [{ id: id("l"), label: "rezaei.dev", url: "https://rezaei.dev" }],
    profileImage: null, uppercaseName: false, photoStyle: "round", imageSide: "left",
    fieldVisibility: { jobTitle: true, phone: true, links: true, email: true, location: true, photo: true, dateOfBirth: false, nationality: false, militaryService: false },
  },
  summary: { html: "<p>توسعه‌دهندهٔ وب حرفه‌ای با بیش از ۵ سال تجربه در طراحی و ساخت رابط‌های کاربری مدرن، سریع و مقیاس‌پذیر.</p>" },
  experience: [exp("توسعه‌دهندهٔ ارشد فرانت‌اند", "شرکت فناوری آسا", "2023-06-01", "", true, [
    "رهبری بازطراحی کامل داشبورد سازمانی با React و TypeScript",
    "کاهش زمان بارگذاری تا ۴۰٪ با بهینه‌سازی رندر و بارگذاری تنبل",
  ])],
  skills: [{ id: id("sk"), name: "", showTitle: false, skills: ["React", "TypeScript", "Next.js"].map((n) => ({ id: id("k"), name: n, level: 4 })) }],
  education: [{ id: id("edu"), degree: "کارشناسی ارشد نرم‌افزار", university: "دانشگاه صنعتی شریف", startDate: "2021-09-01", endDate: "2023-06-01", gpa: "", achievements: "", city: "" }],
  projects: [
    { id: id("p"), name: "سامانهٔ مدیریت وظایف", role: "", link: "https://taskly.app", linkVisible: true, description: "اپ مدیریت پروژه با React و Node.js." },
    { id: id("p"), name: "وب‌سایت شخصی", role: "", link: "https://rezaei.dev", linkVisible: true, description: "ساخته‌شده با Next.js." },
  ],
  languages: [{ id: id("lang"), name: "فارسی", level: 5, showBars: false, showLevelText: true }],
  certifications: [{ id: id("c"), name: "توسعهٔ حرفه‌ای React", issuer: "Frontend Masters", date: "2022-06-01" }],
  achievements: [],
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
await page.goto(BASE, { waitUntil: "load" });
await page.evaluate((data) => {
  localStorage.clear();
  localStorage.setItem("ai-res:occupation-category", JSON.stringify({ id: "software-it", explicit: true }));
  localStorage.setItem("ai-res:resume", JSON.stringify(data));
}, resume);
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector(".a4-page");
await page.waitForTimeout(800);

const measured = await page.evaluate(() => {
  const n = (v) => Math.round(parseFloat(v) * 100) / 100;
  const pg = document.querySelector(".a4-page");
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const byText = (sel, text) => [...pg.querySelectorAll(sel)].find((e) => (e.textContent ?? "").trim().startsWith(text));
  const inputVal = (v) => [...pg.querySelectorAll("input")].find((i) => i.value === v);

  const panel = [...pg.querySelectorAll("div")].find((d) => {
    const s = getComputedStyle(d);
    return s.borderRadius === "15px" && s.backgroundColor !== "rgba(0, 0, 0, 0)" && d.getBoundingClientRect().height > 100;
  });
  const panelCs = cs(panel);
  const grid = [...pg.querySelectorAll("div")].find((d) => getComputedStyle(d).display === "grid" && getComputedStyle(d).gridTemplateColumns.split(" ").length === 2);
  const gridCs = cs(grid);
  // Photo: the largest square element on the page (the ProfileImageEditor box).
  const photo = [...pg.querySelectorAll("div, button, label")]
    .map((d) => ({ el: d, r: d.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 60 && Math.abs(r.width - r.height) < 2)
    .sort((a, b) => b.r.width - a.r.width)[0]?.el;

  // Rails: thin absolutely-positioned bars.
  const rails = [...pg.querySelectorAll('[aria-hidden="true"]')].filter((el) => {
    const s = getComputedStyle(el);
    return s.position === "absolute" && parseFloat(s.width) < 3 && parseFloat(s.height) > 20;
  });
  // Markers: small round bordered boxes.
  const dots = [...pg.querySelectorAll('[aria-hidden="true"]')].filter((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width >= 9 && r.width <= 14 && Math.abs(r.width - r.height) < 1 && parseFloat(s.borderTopWidth) > 0;
  });
  const inPanel = (el) => panel && panel.contains(el);
  const mainDot = dots.find((d) => !inPanel(d));
  const panelDot = dots.find((d) => inPanel(d));
  const mainRail = rails.find((r) => !inPanel(r));
  const panelRail = rails.find((r) => inPanel(r));

  const mainH2 = [...pg.querySelectorAll("h2")].find((h) => !inPanel(h));
  const panelH2 = [...pg.querySelectorAll("h2")].find((h) => inPanel(h));
  const name = inputVal("محمدحسین رضایی");
  const job = inputVal("توسعه‌دهندهٔ وب");
  const expTitle = inputVal("توسعه‌دهندهٔ ارشد فرانت‌اند");
  const projName = inputVal("سامانهٔ مدیریت وظایف");
  const certName = inputVal("توسعهٔ حرفه‌ای React");
  const degree = inputVal("کارشناسی ارشد نرم‌افزار");
  const school = inputVal("دانشگاه صنعتی شریف");
  const skill = inputVal("React");
  const email = inputVal("rezaei.dev@gmail.com");
  const summaryEd = [...pg.querySelectorAll('[contenteditable="true"]')].find((e) => (e.textContent ?? "").includes("حرفه‌ای با بیش"));
  const bulletEd = [...pg.querySelectorAll('[contenteditable="true"]')].find((e) => (e.textContent ?? "").includes("رهبری بازطراحی"));
  const bulletList = bulletEd?.closest("div")?.parentElement?.parentElement;
  // Projects grid: nearest grid ancestor of a project name.
  const gridAncestor = (el) => {
    for (let p = el?.parentElement; p && p !== pg; p = p.parentElement) {
      if (getComputedStyle(p).display === "grid") return p;
    }
    return null;
  };
  const projGrid = gridAncestor(projName);
  const projGridCs = projGrid ? getComputedStyle(projGrid) : null;
  // Contact stack: nearest column-flex ancestor of the email that holds ≥2 rows.
  let contactStack = null;
  for (let p = email?.parentElement; p && p !== pg; p = p.parentElement) {
    const s = getComputedStyle(p);
    if (s.display === "flex" && s.flexDirection === "column" && p.children.length >= 2) {
      contactStack = p;
      break;
    }
  }
  const contactIcon = contactStack?.querySelector("span > svg")?.parentElement;

  const rail = (el) => (el ? { w: n(getComputedStyle(el).width), color: getComputedStyle(el).backgroundColor } : null);
  const dot = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return { size: n(r.width), border: n(s.borderTopWidth), color: s.borderTopColor, fill: s.backgroundColor };
  };
  const type = (el) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    return { fs: n(s.fontSize), fw: s.fontWeight, ls: s.letterSpacing === "normal" ? "normal" : n(s.letterSpacing), lh: n(s.lineHeight), color: s.color };
  };

  return {
    pagePadTop: n(getComputedStyle(grid).paddingTop),
    pagePadInline: n(getComputedStyle(grid).paddingInline || getComputedStyle(grid).paddingLeft),
    columnGap: n(gridCs.columnGap),
    gridTemplate: gridCs.gridTemplateColumns,
    panelRadius: n(panelCs.borderTopLeftRadius),
    panelPadTop: n(panelCs.paddingTop), panelPadBottom: n(panelCs.paddingBottom),
    panelPadStart: n(panelCs.paddingRight), panelPadEnd: n(panelCs.paddingLeft),
    panelFontSizeEm: n(panelCs.fontSize) / 15,
    photoSize: photo ? n(photo.getBoundingClientRect().width) : null,
    mainRail: rail(mainRail), panelRail: rail(panelRail),
    mainDot: dot(mainDot), panelDot: dot(panelDot),
    mainRailColumnW: mainDot ? n(getComputedStyle(mainDot.parentElement).width) : null,
    panelRailColumnW: panelDot ? n(getComputedStyle(panelDot.parentElement).width) : null,
    mainContentPad: mainDot ? n(getComputedStyle(mainDot.parentElement.nextElementSibling).paddingRight) : null,
    panelContentPad: panelDot ? n(getComputedStyle(panelDot.parentElement.nextElementSibling).paddingRight) : null,
    mainH2: type(mainH2), panelH2: type(panelH2),
    name: type(name), job: type(job), expTitle: type(expTitle),
    projName: type(projName), certName: type(certName),
    degree: type(degree), school: type(school), skill: type(skill), email: type(email),
    summary: type(summaryEd), bullet: type(bulletEd),
    bulletListGap: bulletList ? n(getComputedStyle(bulletList).rowGap) : null,
    bulletListTop: bulletList ? n(getComputedStyle(bulletList).marginTop) : null,
    projGridCols: projGridCs ? projGridCs.gridTemplateColumns.split(" ").length : null,
    projGridColGap: projGridCs ? n(projGridCs.columnGap) : null,
    projGridRowGap: projGridCs ? n(projGridCs.rowGap) : null,
    contactRowGap: contactStack ? n(getComputedStyle(contactStack).rowGap) : null,
    contactIconSize: contactIcon ? n(getComputedStyle(contactIcon).fontSize) : null,
    contactIconGap: contactIcon ? n(getComputedStyle(contactIcon.parentElement).columnGap) : null,
  };
});

// Reference values, verbatim from Resume.dc.html.
const REF = {
  pagePadTop: 24, pagePadInline: 28, columnGap: 24, gridTemplate: "30% / rest",
  panelRadius: 15, panelPadTop: 58, panelPadBottom: 24, panelPadStart: 14, panelPadEnd: 16,
  panelFontSizeEm: 1, photoSize: 150,
  mainRailW: 1.5, panelRailW: 1.5,
  mainDotSize: 12, mainDotBorder: 1.5, panelDotSize: 11, panelDotBorder: 1.5,
  mainRailColumnW: 20, panelRailColumnW: 17, mainContentPad: 12, panelContentPad: 10,
  mainH2: { fs: 19, fw: "800", ls: 0.57 }, panelH2: { fs: 14, fw: "800", ls: 0.28 },
  name: { fs: 44, fw: "900", lh: 45.76 }, job: { fs: 16, fw: "600", ls: 2.24 },
  expTitle: { fs: 12.5, fw: "700", ls: 0.375 },
  projName: { fs: 12.5, fw: "700" }, certName: { fs: 13, fw: "700" },
  degree: { fs: 12, fw: "700" }, school: { fs: 11.5 }, skill: { fs: 11.5 }, email: { fs: 11.5 },
  summary: { fs: 12, lh: 22.2 }, bullet: { fs: 11.5, lh: 18.4 },
  bulletListGap: 3, bulletListTop: 6,
  projGridCols: 2, projGridColGap: 26, projGridRowGap: 12,
  contactRowGap: 9, contactIconSize: 13, contactIconGap: 8,
};

const rows = [];
const cmp = (label, ref, got, tol = 0.75) => {
  const num = typeof ref === "number" && typeof got === "number";
  const ok = num ? Math.abs(ref - got) <= tol : String(ref) === String(got);
  rows.push({ property: label, reference: ref, measured: got, match: ok ? "=" : "DIFF" });
};

cmp("page padding-block", REF.pagePadTop, measured.pagePadTop);
cmp("page padding-inline", REF.pagePadInline, measured.pagePadInline);
cmp("column gap", REF.columnGap, measured.columnGap);
cmp("panel radius", REF.panelRadius, measured.panelRadius);
cmp("panel padding-top (photo)", REF.panelPadTop, measured.panelPadTop);
cmp("panel padding-bottom", REF.panelPadBottom, measured.panelPadBottom);
cmp("panel padding-start", REF.panelPadStart, measured.panelPadStart);
cmp("panel padding-end", REF.panelPadEnd, measured.panelPadEnd);
cmp("panel text scale (em)", REF.panelFontSizeEm, Math.round(measured.panelFontSizeEm * 1000) / 1000, 0.001);
cmp("photo size", REF.photoSize, measured.photoSize, 1.5);
cmp("main rail thickness", REF.mainRailW, measured.mainRail?.w);
cmp("panel rail thickness", REF.panelRailW, measured.panelRail?.w);
cmp("main rail column width", REF.mainRailColumnW, measured.mainRailColumnW);
cmp("panel rail column width", REF.panelRailColumnW, measured.panelRailColumnW);
cmp("main rail→content pad", REF.mainContentPad, measured.mainContentPad);
cmp("panel rail→content pad", REF.panelContentPad, measured.panelContentPad);
cmp("main marker size", REF.mainDotSize, measured.mainDot?.size);
cmp("main marker border", REF.mainDotBorder, measured.mainDot?.border);
cmp("panel marker size", REF.panelDotSize, measured.panelDot?.size);
cmp("panel marker border", REF.panelDotBorder, measured.panelDot?.border);
cmp("main h2 font-size", REF.mainH2.fs, measured.mainH2?.fs);
cmp("main h2 weight", REF.mainH2.fw, measured.mainH2?.fw);
cmp("main h2 letter-spacing", REF.mainH2.ls, measured.mainH2?.ls, 0.02);
cmp("panel h2 font-size", REF.panelH2.fs, measured.panelH2?.fs);
cmp("panel h2 weight", REF.panelH2.fw, measured.panelH2?.fw);
cmp("panel h2 letter-spacing", REF.panelH2.ls, measured.panelH2?.ls, 0.02);
cmp("name font-size", REF.name.fs, measured.name?.fs);
cmp("name weight", REF.name.fw, measured.name?.fw);
cmp("name line-height", REF.name.lh, measured.name?.lh, 1);
cmp("job title font-size", REF.job.fs, measured.job?.fs);
cmp("job title weight", REF.job.fw, measured.job?.fw);
cmp("job title letter-spacing", REF.job.ls, measured.job?.ls, 0.05);
cmp("entry title font-size", REF.expTitle.fs, measured.expTitle?.fs);
cmp("entry title weight", REF.expTitle.fw, measured.expTitle?.fw);
cmp("entry title letter-spacing", REF.expTitle.ls, measured.expTitle?.ls, 0.02);
cmp("project name font-size", REF.projName.fs, measured.projName?.fs);
cmp("project name weight", REF.projName.fw, measured.projName?.fw);
cmp("certificate name font-size", REF.certName.fs, measured.certName?.fs);
cmp("certificate name weight", REF.certName.fw, measured.certName?.fw);
cmp("degree font-size", REF.degree.fs, measured.degree?.fs);
cmp("degree weight", REF.degree.fw, measured.degree?.fw);
cmp("school font-size", REF.school.fs, measured.school?.fs);
cmp("skill row font-size", REF.skill.fs, measured.skill?.fs);
cmp("contact text font-size", REF.email.fs, measured.email?.fs);
cmp("contact row gap", REF.contactRowGap, measured.contactRowGap);
cmp("contact icon size", REF.contactIconSize, measured.contactIconSize);
cmp("contact icon gap", REF.contactIconGap, measured.contactIconGap);
cmp("about font-size", REF.summary.fs, measured.summary?.fs);
cmp("about line-height", REF.summary.lh, measured.summary?.lh, 0.5);
cmp("bullet font-size", REF.bullet.fs, measured.bullet?.fs);
cmp("bullet line-height", REF.bullet.lh, measured.bullet?.lh, 0.5);
cmp("bullet list gap", REF.bulletListGap, measured.bulletListGap);
cmp("bullet list margin-top", REF.bulletListTop, measured.bulletListTop);
cmp("projects grid columns", REF.projGridCols, measured.projGridCols);
cmp("projects grid column gap", REF.projGridColGap, measured.projGridColGap, 1);
cmp("projects grid row gap", REF.projGridRowGap, measured.projGridRowGap, 1);

const pad = (s, w) => String(s).padEnd(w);
console.log(pad("PROPERTY", 30) + pad("REFERENCE", 14) + pad("MEASURED", 14) + "MATCH");
console.log("-".repeat(70));
for (const r of rows) console.log(pad(r.property, 30) + pad(r.reference, 14) + pad(r.measured, 14) + r.match);
const diffs = rows.filter((r) => r.match === "DIFF");
console.log(`\n${rows.length - diffs.length}/${rows.length} match; ${diffs.length} differ`);
if (diffs.length) console.log(JSON.stringify(diffs, null, 2));
await browser.close();
