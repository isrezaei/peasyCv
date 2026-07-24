// Measured verification of the "timeline-panel" template against Resume.dc.html.
//   node scripts/verify-timeline-panel.mjs
import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { createPdfClient } from "./backend-api.mjs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";
const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const LONG = "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.";

const ALL_THEMES = ["sage","lavender","skyBlue","dustyRose","mint","softCoral","peach","ocean","slate","grey","indigo","navyGold","crimsonCopper","violetOrange","midnightMint","azurePeach","charcoalLemon","charcoalAmber","smokyCoral","charcoalJade","purpleRose","inkFuchsia","graphiteGold"];

const section = (type, title, order) => ({
  id: id("s"), type, title, visible: true, direction: "rtl", order,
  languageMeterVariant: "dots", languageShowMeter: true, languageShowLevelText: true,
  skillDisplayMode: "row", skillShowLevel: false, skillMeterVariant: "dots",
  showMonth: true, monthFormat: "name", achievementShowDescription: true, achievementShowIcons: true,
});
const CONTACTS = { fullName: "محمد حسین رضایی", jobTitle: "توسعه‌دهنده وب", phone: "۰۹۲۰۰۵۰۱۳۷۹", location: "تهران", email: "rezaeiism@gmail.com", dateOfBirth: "متولد ۱۳۷۹", nationality: "ایرانی", militaryService: "معافیت دائم" };

const exp = (n) => ({ id: id("exp"), jobTitle: `تجربه شماره ${n}`, companyName: "شرکت نرم‌افزاری پویاتیت", period: { start: "۱۴۰۵", end: "۱۴۰۵", current: false }, city: "تهران", projectLink: "", projectDescription: LONG, link: "", linkVisible: false, responsibilities: [{ id: id("r"), text: "موجود در ارائه راهکارها." }, { id: id("r"), text: "پیاده‌سازی سامانه." }] });

function fullResume(themeId, opts = {}) {
  const { experiences = 3, hidden = {}, sections: secOverride } = opts;
  return {
    id: id("resume"), title: "verify", locale: "fa", templateId: "timeline-panel",
    theme: { themeId, pageBackground: "theme", backgroundPattern: "none", backgroundIntensity: 0.7, dateCalendar: "jalali", fontFamily: "vazirmatn", fontScale: 1, lineHeight: 1.5, pageMargin: 16, sectionSpacing: 6, columnIntensity: 1, columnWidth: "medium", showSectionSeparators: false, showSectionIcons: false, atsMode: false },
    sections: secOverride ?? [section("summary","درباره من",0), section("experience","تجربه کاری",1), section("education","تحصیلات",2), section("achievements","دستاوردهای کلیدی",3), section("skills","مهارت‌ها",4), section("projects","پروژه‌ها",5), section("languages","زبان‌ها",6), section("certifications","گواهینامه‌ها",7)],
    personalInfo: { ...CONTACTS, links: [], profileImage: null, uppercaseName: false, photoStyle: "round", imageSide: "left",
      fieldVisibility: { jobTitle: true, phone: !hidden.contacts, links: false, email: !hidden.contacts, location: !hidden.location && !hidden.contacts, photo: !hidden.photo, dateOfBirth: !hidden.contacts, nationality: !hidden.contacts, militaryService: !hidden.contacts } },
    summary: { html: `<p>${LONG}</p>` },
    experience: Array.from({ length: experiences }, (_, i) => exp(i + 1)),
    skills: [{ id: id("sk"), name: "تست ۱", showTitle: true, skills: ["React","TypeScript","Next.js"].map((n) => ({ id: id("k"), name: n, level: 3 })) }],
    education: [{ id: id("edu"), degree: "کارشناسی مهندسی کامپیوتر", university: "دانشگاه نمونه تهران", startDate: "۱۴۰۰", endDate: "۱۴۰۵", gpa: "معدل ۱۷.۲", achievements: "", city: "تهران" }],
    projects: [{ id: id("p"), name: "شرایط فعلی فناوری", role: "", link: "", linkVisible: false, description: "توضیح کوتاه پروژه." }],
    languages: [{ id: id("lang"), name: "انگلیسی", level: 4, showBars: true, showLevelText: true }],
    certifications: [{ id: id("c"), name: "گواهی React", issuer: "", date: "۱۴۰۵" }],
    achievements: [{ id: id("a"), title: "از صنعت چاپ", description: "تست متن نمونه" }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

const relLum = (rgb) => { const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map((n) => { const s = +n / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

async function seed(data) {
  await page.evaluate((d) => localStorage.setItem("ai-res:resume", JSON.stringify(d)), data);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".a4-page");
  await page.waitForTimeout(500);
  try { await page.getByText("رد شدن", { exact: true }).click({ timeout: 1000 }); await page.waitForTimeout(200); } catch {}
}

// Shared in-page helpers, injected as a string into evaluate calls.
const PROBE = () => {
  const p = document.querySelector(".a4-page");
  const num = (v) => Math.round(parseFloat(v) * 100) / 100;
  const cs = (el) => getComputedStyle(el);
  // The panel card = the element carrying the 15px radius inside the page.
  const panel = [...p.querySelectorAll("div")].find((d) => cs(d).borderTopLeftRadius === "15px");
  const headings = [...p.querySelectorAll("h2")];
  // A "track" = the flex row whose first child is the rail gutter (20px / 17px).
  const tracks = [...p.querySelectorAll("div")].filter((d) => {
    const first = d.firstElementChild;
    if (!first || cs(d).display !== "flex") return false;
    const w = num(cs(first).width);
    return (w === 20 || w === 17) && cs(first).position === "relative";
  });
  const trackInfo = tracks.map((tr) => {
    const gutter = tr.firstElementChild;
    const kids = [...gutter.children];
    const line = kids.find((k) => num(cs(k).width) <= 2);
    const dot = kids.find((k) => cs(k).borderTopLeftRadius !== "0px" && num(cs(k).width) > 2);
    const gRect = gutter.getBoundingClientRect();
    return {
      gutterW: num(cs(gutter).width),
      contentPad: num(cs(tr.lastElementChild).paddingInlineStart || cs(tr.lastElementChild).paddingRight),
      line: line ? { w: num(cs(line).width), cx: num(line.getBoundingClientRect().left + line.getBoundingClientRect().width / 2), top: num(line.getBoundingClientRect().top), bottom: num(line.getBoundingClientRect().bottom), bg: cs(line).backgroundColor } : null,
      dot: dot ? { w: num(cs(dot).width), h: num(cs(dot).height), border: num(cs(dot).borderTopWidth), cx: num(dot.getBoundingClientRect().left + dot.getBoundingClientRect().width / 2), top: num(dot.getBoundingClientRect().top), bg: cs(dot).backgroundColor, borderColor: cs(dot).borderTopColor } : null,
      gutterCx: num(gRect.left + gRect.width / 2),
      heading: (() => { const h = tr.querySelector("h2"); if (!h) return null; const s = cs(h); return { fs: num(s.fontSize), fw: s.fontWeight, ls: num(s.letterSpacing), color: s.color, text: h.textContent }; })(),
    };
  });
  const grid = [...p.querySelectorAll("div")].find((d) => cs(d).display === "grid" && cs(d).gridTemplateColumns.split(" ").length === 2 && parseFloat(cs(d).columnGap) > 20);
  const nameInput = [...p.querySelectorAll("input")].find((i) => i.value === "محمد حسین رضایی");
  const titleInput = [...p.querySelectorAll("input")].find((i) => i.value === "توسعه‌دهنده وب");
  const emailInput = [...p.querySelectorAll("input")].find((i) => i.value.includes("@"));
  const photo = p.querySelector('[class*="chakra-avatar"]') ?? p.querySelector("[data-scope='avatar']");
  return {
    pages: document.querySelectorAll(".a4-page").length,
    grid: grid ? { cols: cs(grid).gridTemplateColumns, gap: num(cs(grid).columnGap), minH: num(cs(grid).minHeight) } : null,
    panel: panel ? {
      radius: cs(panel).borderTopLeftRadius, bg: cs(panel).backgroundColor,
      padTop: num(cs(panel).paddingTop), padBottom: num(cs(panel).paddingBottom),
      padStart: num(cs(panel).paddingInlineStart), padEnd: num(cs(panel).paddingInlineEnd),
      w: num(panel.getBoundingClientRect().width), h: num(panel.getBoundingClientRect().height),
      top: num(panel.getBoundingClientRect().top), bottom: num(panel.getBoundingClientRect().bottom),
    } : null,
    photo: photo ? { w: num(photo.getBoundingClientRect().width), bottom: num(photo.getBoundingClientRect().bottom) } : null,
    name: nameInput ? { fs: num(cs(nameInput).fontSize), fw: cs(nameInput).fontWeight, lh: num(cs(nameInput).lineHeight), ls: cs(nameInput).letterSpacing, color: cs(nameInput).color } : null,
    jobTitle: titleInput ? { fs: num(cs(titleInput).fontSize), fw: cs(titleInput).fontWeight, ls: num(cs(titleInput).letterSpacing), color: cs(titleInput).color, gapFromName: nameInput ? num(titleInput.getBoundingClientRect().top - nameInput.getBoundingClientRect().bottom) : null } : null,
    contact: emailInput ? (() => {
      const item = emailInput.closest("div");            // the ContactField HStack
      const list = item.parentElement;                   // the stacked VStack
      const icon = item.querySelector("span");
      const iconR = icon && icon.getBoundingClientRect();
      const textR = emailInput.getBoundingClientRect();
      return { fs: num(cs(emailInput).fontSize), rowGap: num(cs(list).rowGap), itemGap: num(cs(item).columnGap), iconToTextPx: iconR ? num(Math.abs(textR.right - iconR.left)) : null, iconFs: icon ? num(cs(icon).fontSize) : null, color: cs(emailInput).color, order: [...list.children].length };
    })() : null,
    tracks: trackInfo,
    headingCount: headings.length,
    overflowX: p.scrollWidth > p.clientWidth + 1,
    pageW: num(p.getBoundingClientRect().width),
    perEntryRails: p.querySelectorAll('[data-testid="timeline-rail-line"]').length,
  };
};

await page.goto(BASE, { waitUntil: "load" });
await seed(fullResume("sage"));

const m = await page.evaluate(PROBE);
console.log("=== BASELINE (sage, 3 experiences) ===");
console.log(JSON.stringify({ pages: m.pages, grid: m.grid, panel: m.panel, photo: m.photo, name: m.name, jobTitle: m.jobTitle, contact: m.contact, overflowX: m.overflowX, pageW: m.pageW, perEntryRails: m.perEntryRails }, null, 2));
console.log("--- tracks ---");
console.table(m.tracks.map((t) => ({ heading: t.heading?.text ?? "(none)", fs: t.heading?.fs, fw: t.heading?.fw, ls: t.heading?.ls, gutterW: t.gutterW, pad: t.contentPad, lineW: t.line?.w, dotW: t.dot?.w, dotBorder: t.dot?.border, dotCx_minus_lineCx: t.line && t.dot ? Math.round((t.dot.cx - t.line.cx) * 100) / 100 : null, railTop_minus_dotCenter: t.line && t.dot ? Math.round((t.line.top - (t.dot.top + t.dot.w / 2)) * 100) / 100 : null })));

// Rail chaining: each rail's bottom vs the NEXT track's dot top, per region.
const chain = m.tracks.map((t, i) => {
  const next = m.tracks[i + 1];
  if (!t.line || !next?.dot) return null;
  // Only compare within the same region (same gutter width).
  if (t.gutterW !== next.gutterW) return null;
  return { from: t.heading?.text, to: next.heading?.text, railBottom_to_nextDotTop: Math.round((next.dot.top - t.line.bottom) * 100) / 100 };
}).filter(Boolean);
console.log("--- rail chaining (reference: 3px tuck above the next marker) ---");
console.table(chain);

const perPage = await page.evaluate(() => [...document.querySelectorAll(".a4-page")].map((p, i) => {
  const cs = (el) => getComputedStyle(el);
  const panel = [...p.querySelectorAll("div")].find((d) => cs(d).borderTopLeftRadius === "15px");
  const grid = [...p.querySelectorAll("div")].find((d) => cs(d).display === "grid");
  const pr = p.getBoundingClientRect();
  const gr = grid && grid.getBoundingClientRect();
  const dot = p.querySelector("div[aria-hidden] + div[aria-hidden]");
  return { page: i, panel: Boolean(panel), gridCols: grid && cs(grid).gridTemplateColumns, contentOverflowPx: gr ? Math.round(gr.bottom - (pr.bottom - 60.47)) : null, overflowX: p.scrollWidth > p.clientWidth + 1 };
}));
console.log("--- per page ---"); console.table(perPage);
const dotCss = await page.evaluate(() => { const d = [...document.querySelectorAll(".a4-page div")].find((x) => getComputedStyle(x).borderTopStyle === "solid" && Math.round(parseFloat(getComputedStyle(x).width)) === 12); return d ? { inline: d.getAttribute("style"), cls: d.className, computed: getComputedStyle(d).borderTopWidth, client: d.clientWidth, rule: [...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } }).filter(r => r.cssText && r.cssText.includes("border-width") && r.cssText.includes(d.className.split(" ")[0])).map(r => r.cssText).slice(0,3) } : null; });
console.log("DOT BORDER:", JSON.stringify(dotCss));
await page.locator(".resume-pages").screenshot({ path: "scripts/tp-baseline.png" }).catch(() => {});

// ---- Timeline with 1 / 2 / many entries -----------------------------------
for (const n of [1, 2, 8]) {
  await seed(fullResume("sage", { experiences: n }));
  const r = await page.evaluate(PROBE);
  const bad = r.tracks.filter((t) => t.line && t.dot && Math.abs(t.dot.cx - t.line.cx) > 0.6);
  const misTop = r.tracks.filter((t) => t.line && t.dot && Math.abs(t.line.top - (t.dot.top + t.dot.w / 2)) > 0.6);
  console.log(`ENTRIES=${n}: pages=${r.pages} tracks=${r.tracks.length} dotsWithRail=${r.tracks.filter(t=>t.dot&&t.line).length} misalignedX=${bad.length} misalignedTop=${misTop.length} overflowX=${r.overflowX} perEntryRails=${r.perEntryRails}`);
}

// ---- Graceful degradation --------------------------------------------------
await seed(fullResume("sage", { hidden: { photo: true } }));
const noPhoto = await page.evaluate(PROBE);
console.log("NO PHOTO: panel padTop =", noPhoto.panel?.padTop, "(reference bare card = 24px), photo =", noPhoto.photo);

// Empty side panel: drop education/languages/skills sections entirely.
const hiddenSide = [section("summary","درباره من",0), section("experience","تجربه کاری",1), section("projects","پروژه‌ها",2),
  { ...section("education","تحصیلات",3), visible: false }, { ...section("skills","مهارت‌ها",4), visible: false }, { ...section("languages","زبان‌ها",5), visible: false },
  { ...section("achievements","دستاوردها",6), visible: false }, { ...section("certifications","گواهی‌ها",7), visible: false }];
const onlyMain = hiddenSide;
await seed(fullResume("sage", { sections: onlyMain, hidden: { photo: true, contacts: true } }));
const noSide = await page.evaluate(() => {
  const p = document.querySelector(".a4-page");
  const panel = [...p.querySelectorAll("div")].find((d) => getComputedStyle(d).borderTopLeftRadius === "15px");
  const grid = [...p.querySelectorAll("div")].find((d) => getComputedStyle(d).display === "grid" && parseFloat(getComputedStyle(d).gap || 0) > 20 || getComputedStyle(d).display === "grid" && d.querySelector("h2"));
  return { panelExists: Boolean(panel), gridCols: grid ? getComputedStyle(grid).gridTemplateColumns : null, overflowX: p.scrollWidth > p.clientWidth + 1 };
});
console.log("EMPTY SIDE PANEL (no photo, no side sections):", JSON.stringify(noSide));

// ---- Every theme: panel stays light + rail harmonises -----------------------
const themeRows = [];
for (const themeId of ALL_THEMES) {
  await seed(fullResume(themeId));
  const r = await page.evaluate(() => {
    const p = document.querySelector(".a4-page");
    const cs = (el) => getComputedStyle(el);
    const panel = [...p.querySelectorAll("div")].find((d) => cs(d).borderTopLeftRadius === "15px");
    const tracks = [...p.querySelectorAll("div")].filter((d) => {
      const f = d.firstElementChild;
      return f && cs(d).display === "flex" && cs(f).position === "relative" && [20, 17].includes(Math.round(parseFloat(cs(f).width)));
    });
    const mainTrack = tracks.find((t) => Math.round(parseFloat(cs(t.firstElementChild).width)) === 20);
    const line = mainTrack ? [...mainTrack.firstElementChild.children].find((k) => parseFloat(cs(k).width) <= 2) : null;
    return { panelBg: panel ? cs(panel).backgroundColor : null, pageBg: cs(p).backgroundColor, mainRail: line ? cs(line).backgroundColor : null };
  });
  const pl = r.panelBg ? relLum(r.panelBg) : 0;
  const rl = r.mainRail ? relLum(r.mainRail) : 1;
  const railContrast = +(1.05 / (rl + 0.05)).toFixed(2);
  themeRows.push({ theme: themeId, panelBg: r.panelBg, panelLum: +pl.toFixed(3), light: pl >= 0.57, pageWhite: r.pageBg === "rgb(255, 255, 255)", mainRail: r.mainRail, railContrast, railVisible: railContrast >= 1.95 });
}
console.table(themeRows);
console.log("ALL PANELS LIGHT:", themeRows.every((t) => t.light), "| ALL PAGES WHITE:", themeRows.every((t) => t.pageWhite), "| ALL RAILS VISIBLE:", themeRows.every((t) => t.railVisible));


// ---- PDF parity: the backend renderer must keep the panel fill + the rails ---
await seed(fullResume("sage"));
try {
  const client = await createPdfClient();
  const base = await client.defaultResume();
  const doc = { ...fullResume("sage"), id: base.id, createdAt: base.createdAt, updatedAt: base.updatedAt };
  const pdf = await client.renderPdf(doc);
  const head = pdf.subarray(0, 5).toString("latin1");
  const text = pdf.toString("latin1");
  const pageCount = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log("PDF:", JSON.stringify({
    magic: head,
    bytes: pdf.length,
    ok: head === "%PDF-" && pdf.length > 20000,
    fontsEmbedded: /FontFile2|FontFile3|FontFile\b/.test(text),
    pages: pageCount,
  }));
  writeFileSync("scripts/tp-export.pdf", pdf);
} catch (e) {
  console.log("PDF: FAILED —", e.message);
}

console.log("CONSOLE_ERRORS:", JSON.stringify(errors));

// ---- PRINT SURFACE: the exact DOM the Puppeteer PDF pipeline captures --------
// (backend/src/pdf/pdf.service.ts: goto /print → emulateMediaType('print') →
//  page.pdf({ printBackground: true }); reproduced here so the panel fill, the
//  rail geometry and the page breaks can be MEASURED, not just eyeballed.)
const printPage = await browser.newPage({ viewport: { width: 900, height: 1400 } });
const printErrors = [];
printPage.on("console", (m) => m.type() === "error" && printErrors.push(m.text()));
printPage.on("pageerror", (e) => printErrors.push(String(e)));
await printPage.emulateMedia({ media: "print" });
await printPage.addInitScript((d) => { window.__RESUME_DATA__ = d; }, fullResume("sage"));
await printPage.goto(`${BASE}/print`, { waitUntil: "networkidle" });
await printPage.waitForSelector(".a4-page");
await printPage.waitForTimeout(900);

const printMeasure = await printPage.evaluate(() => {
  const num = (v) => Math.round(parseFloat(v) * 100) / 100;
  const cs = (el) => getComputedStyle(el);
  return [...document.querySelectorAll('.a4-page')].map((p, i) => {
    const panel = [...p.querySelectorAll('div')].find((d) => cs(d).borderTopLeftRadius === '15px');
    const tracks = [...p.querySelectorAll('div')].filter((d) => {
      const f = d.firstElementChild;
      return f && cs(d).display === 'flex' && cs(f).position === 'relative' && [20, 17].includes(Math.round(parseFloat(cs(f).width)));
    });
    const rails = [];
    for (const tr of tracks) {
      const g = tr.firstElementChild;
      const kids = [...g.children];
      const line = kids.find((k) => cs(k).position === 'absolute');
      const dot = kids.find((k) => cs(k).position === 'relative');
      rails.push({
        region: Math.round(parseFloat(cs(g).width)) === 20 ? 'main' : 'panel',
        hasLine: Boolean(line),
        hasDot: Boolean(dot),
        lineWidth: line ? num(cs(line).width) : null,
        lineAdjust: line ? cs(line).printColorAdjust : null,
        dx: line && dot ? num((dot.getBoundingClientRect().left + dot.getBoundingClientRect().width / 2) - (line.getBoundingClientRect().left + line.getBoundingClientRect().width / 2)) : null,
        dTop: line && dot ? num(line.getBoundingClientRect().top - (dot.getBoundingClientRect().top + dot.getBoundingClientRect().height / 2)) : null,
      });
    }
    const withLine = rails.filter((r) => r.hasLine);
    const pr = p.getBoundingClientRect();
    return {
      page: i,
      panelBg: panel ? cs(panel).backgroundColor : '(no panel — single-column page)',
      panelAdjust: panel ? cs(panel).printColorAdjust : null,
      panelToPageBottomPx: panel ? num(pr.bottom - 60.47 - panel.getBoundingClientRect().bottom) : null,
      rails: rails.length,
      railsWithLine: withLine.length,
      lineWidths: [...new Set(withLine.map((r) => r.lineWidth))].join(','),
      lineAdjust: [...new Set(withLine.map((r) => r.lineAdjust))].join(','),
      maxDx: withLine.length ? Math.max(...withLine.map((r) => Math.abs(r.dx))) : 0,
      maxDTop: withLine.length ? Math.max(...withLine.map((r) => Math.abs(r.dTop))) : 0,
      overflowX: p.scrollWidth > p.clientWidth + 1,
      overflowY: p.scrollHeight > p.clientHeight + 1,
      inputs: p.querySelectorAll('input, textarea').length,
    };
  });
});
console.log("--- PRINT SURFACE (media=print) ---");
console.table(printMeasure);
console.log("PRINT_CONSOLE_ERRORS:", JSON.stringify(printErrors));
await printPage.locator(".a4-page").first().screenshot({ path: "scripts/tp-print-p1.png" }).catch(() => {});
await printPage.locator(".a4-page").nth(1).screenshot({ path: "scripts/tp-print-p2.png" }).catch(() => {});
await printPage.close();
await browser.close();
