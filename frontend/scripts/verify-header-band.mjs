// Measured verification for the header-band template's three edits:
//  (1) Skills = filled pills matching Resume.dc.html
//  (2) Backgrounds always light + harmonised with the header, in EVERY theme
//  (3) Contact row: exact order, icon gap, conditional collapse keeps order
//   node scripts/verify-header-band.mjs
import { chromium } from "playwright-core";

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
const ORDER = ["phone", "email", "location", "dateOfBirth", "nationality", "militaryService"]; // reference order

function fullResume(themeId, hidden = {}) {
  return {
    id: id("resume"), title: "verify", locale: "fa", templateId: "header-band",
    theme: { themeId, pageBackground: "theme", backgroundPattern: "none", backgroundIntensity: 0.7, dateCalendar: "jalali", fontFamily: "vazirmatn", fontScale: 1, lineHeight: 1.5, pageMargin: 16, sectionSpacing: 6, columnIntensity: 1, columnWidth: "medium", showSectionSeparators: false, showSectionIcons: false, atsMode: false },
    sections: [section("summary","درباره من",0), section("experience","تجربه کاری",1), section("education","تحصیلات",2), section("achievements","دستاوردهای کلیدی",3), section("skills","مهارت‌ها",4), section("projects","پروژه‌ها",5), section("languages","زبان‌ها",6), section("certifications","گواهینامه‌ها",7)],
    personalInfo: { ...CONTACTS, links: [], profileImage: null, uppercaseName: false, photoStyle: "round", imageSide: "left",
      fieldVisibility: { jobTitle: true, phone: true, links: false, email: true, location: !hidden.location, photo: true, dateOfBirth: true, nationality: true, militaryService: true } },
    summary: { html: `<p>${LONG}</p>` },
    experience: [{ id: id("exp"), jobTitle: "تست شماره یک", companyName: "شرکت نرم‌افزاری پویاتیت", period: { start: "۱۴۰۵", end: "۱۴۰۵", current: false }, city: "تهران", projectLink: "", projectDescription: LONG, link: "https://react-icons.github.io", linkVisible: true, responsibilities: [{ id: id("r"), text: "موجود در ارائه راهکارها." }] }],
    skills: [
      { id: id("sk"), name: "تست ۱", showTitle: true, skills: ["تست دو سه","تست دو سه","تست دو سه","تست دو سه"].map((n) => ({ id: id("k"), name: n, level: 3 })) },
      { id: id("sk"), name: "تست ۲", showTitle: true, skills: ["تست دو سه","تست دو سه","تست دو سه"].map((n) => ({ id: id("k"), name: n, level: 3 })) },
    ],
    education: [{ id: id("edu"), degree: "کارشناسی مهندسی کامپیوتر", university: "دانشگاه نمونه تهران", startDate: "۱۴۰۰", endDate: "۱۴۰۵", gpa: "معدل ۱۷.۲", achievements: LONG, city: "تهران" }],
    projects: [{ id: id("p"), name: "شرایط فعلی فناوری", role: "", link: "https://react-icons.github.io", linkVisible: true, description: "" }],
    languages: [{ id: id("lang"), name: "انگلیسی", level: 4, showBars: true, showLevelText: true }],
    certifications: [{ id: id("c"), name: "react-icons.github.io", issuer: "", date: "۱۴۰۵" }],
    achievements: [{ id: id("a"), title: "از صنعت چاپ", description: "تست متن نمونه" }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

const relLum = (rgb) => { const [r, g, b] = rgb.match(/\d+/g).slice(0, 3).map((n) => { const s = +n / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

async function seed(data) {
  await page.evaluate((d) => localStorage.setItem("ai-res:resume", JSON.stringify(d)), data);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".a4-page");
  await page.waitForTimeout(450);
  try { await page.getByText("رد شدن", { exact: true }).click({ timeout: 1000 }); await page.waitForTimeout(150); } catch {}
}

await page.goto(BASE, { waitUntil: "load" });
await seed(fullResume("sage"));

// ---- Edit 1 + Edit 3 measurements (sage) -----------------------------------
const measured = await page.evaluate(({ CONTACTS, ORDER }) => {
  const cs = (el, ...p) => { if (!el) return null; const s = getComputedStyle(el); const o = {}; for (const k of p) o[k] = s[k]; return o; };
  const inputByValue = (v) => [...document.querySelectorAll(".a4-page input, .a4-page textarea")].find((i) => i.value === v);

  // Skills: the filled chip = the field's nearest ancestor with a non-transparent bg.
  const skillField = inputByValue("تست دو سه");
  let chip = skillField; while (chip && chip !== document.body) { const bg = getComputedStyle(chip).backgroundColor; if (bg && bg !== "rgba(0, 0, 0, 0)") break; chip = chip.parentElement; }
  const wrap = chip ? chip.parentElement : null; // the Wrap holding the chips
  const groupLabel = inputByValue("تست ۱");
  // Skill groups container (VStack) — parent of the group blocks.
  const skillsSection = groupLabel ? groupLabel.closest("[data-hover-frame]") : null;

  // Contacts: DOM order of the contact fields, mapped to type by their value.
  const valueToType = Object.fromEntries(Object.entries(CONTACTS).filter(([k]) => ORDER.includes(k)).map(([k, v]) => [v, k]));
  const contactInputs = [...document.querySelectorAll(".a4-page input")].filter((i) => valueToType[i.value]);
  const contactOrder = contactInputs.map((i) => valueToType[i.value]);
  const emailInput = inputByValue(CONTACTS.email);
  const contactItemGap = emailInput ? cs(emailInput.closest("[class]")?.parentElement, "gap") : null;

  return {
    chip: chip ? cs(chip, "backgroundColor", "borderTopLeftRadius", "paddingTop", "paddingLeft", "gap") : null,
    chipFontSize: skillField ? getComputedStyle(skillField).fontSize : null,
    chipFontWeight: skillField ? getComputedStyle(skillField).fontWeight : null,
    chipText: skillField ? getComputedStyle(skillField).color : null,
    wrapGap: wrap ? cs(wrap, "gap") : null,
    groupLabelFS: groupLabel ? getComputedStyle(groupLabel).fontSize : null,
    contactOrder,
    contactItemGap,
    overflowX: (() => { const p = document.querySelector(".a4-page"); return p.scrollWidth > p.clientWidth + 1; })(),
  };
}, { CONTACTS, ORDER });
console.log("SKILLS+CONTACTS (sage):", JSON.stringify(measured, null, 2));
await page.locator(".resume-pages").screenshot({ path: "scripts/hb-render.png" }).catch(() => {});

// ---- Edit 3: conditional collapse keeps order ------------------------------
await seed(fullResume("sage", { location: true })); // hide location
const collapsed = await page.evaluate(({ CONTACTS, ORDER }) => {
  const valueToType = Object.fromEntries(Object.entries(CONTACTS).filter(([k]) => ORDER.includes(k)).map(([k, v]) => [v, k]));
  return [...document.querySelectorAll(".a4-page input")].filter((i) => valueToType[i.value]).map((i) => valueToType[i.value]);
}, { CONTACTS, ORDER });
console.log("CONTACT ORDER (location hidden):", JSON.stringify(collapsed));

// ---- Edit 2: every theme → card bg stays LIGHT + harmonised ----------------
const themeResults = [];
for (const themeId of ALL_THEMES) {
  await seed(fullResume(themeId));
  const r = await page.evaluate(() => {
    const inputByValue = (v) => [...document.querySelectorAll(".a4-page input")].find((i) => i.value === v);
    const closestRadius = (el, rad) => { let n = el; while (n && n !== document.body) { if (getComputedStyle(n).borderTopLeftRadius === rad) return n; n = n.parentElement; } return null; };
    const nameEl = inputByValue("محمد حسین رضایی");
    const card = nameEl ? closestRadius(nameEl, "14px") : null;
    const chip = document.querySelector(".a4-page h2")?.parentElement.querySelector("div");
    const skillField = [...document.querySelectorAll(".a4-page input")].find((i) => i.value === "تست دو سه");
    let sChip = skillField; while (sChip && sChip !== document.body) { const bg = getComputedStyle(sChip).backgroundColor; if (bg && bg !== "rgba(0, 0, 0, 0)") break; sChip = sChip.parentElement; }
    return { card: card && getComputedStyle(card).backgroundColor, chip: chip && getComputedStyle(chip).backgroundColor, skill: sChip && getComputedStyle(sChip).backgroundColor };
  });
  const lum = r.card ? relLum(r.card) : 0;
  const harmonised = r.card && r.chip && r.card === r.chip && r.card === r.skill;
  themeResults.push({ themeId, cardBg: r.card, lum: +lum.toFixed(3), light: lum > 0.72, harmonised });
}
console.table(themeResults.map((t) => ({ theme: t.themeId, cardBg: t.cardBg, lum: t.lum, light: t.light, harmonised: t.harmonised })));
const allLight = themeResults.every((t) => t.light);
const allHarmonised = themeResults.every((t) => t.harmonised);
console.log("ALL THEMES LIGHT:", allLight, "| ALL HARMONISED (card=chip=skill):", allHarmonised);
console.log("CONSOLE_ERRORS:", JSON.stringify(errors));
await browser.close();
