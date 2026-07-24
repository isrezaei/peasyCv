// Gap-analysis measurement for the timeline-panel template vs the imported
// reference (Resume.dc.html). Seeds a resume mirroring the reference content,
// renders the CURRENT implementation and measures geometry + computed styles.
//   node scripts/verify-timeline-gap.mjs [--shot-prefix=tp-old]
import { chromium } from "playwright-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";
const PREFIX = (process.argv.find((a) => a.startsWith("--shot-prefix=")) ?? "--shot-prefix=tp-old").split("=")[1];

const id = (p) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

const section = (type, title, order, extra = {}) => ({
  id: id("s"), type, title, visible: true, direction: "rtl", order,
  languageMeterVariant: "bars", languageShowMeter: false, languageShowLevelText: true,
  showMonth: false, monthFormat: "name",
  achievementShowDescription: false, achievementShowIcons: false,
  skillDisplayMode: "list", skillShowLevel: false, skillMeterVariant: "bars",
  ...extra,
});

const exp = (jobTitle, companyName, start, end, current, bullets) => ({
  id: id("exp"), jobTitle, companyName,
  period: { start, end, current }, city: "",
  projectLink: "", projectDescription: "", link: "", linkVisible: false,
  responsibilities: bullets.map((text) => ({ id: id("r"), text })),
});

function fixture() {
  return {
    id: id("resume"), title: "timeline-gap", locale: "fa", templateId: "timeline-panel",
    occupationCategory: "software-it",
    theme: {
      themeId: "peach", pageBackground: "white", backgroundPattern: "none",
      backgroundIntensity: 0.7, dateCalendar: "jalali", fontFamily: "vazirmatn",
      fontScale: 1, lineHeight: 1.5, pageMargin: 16, sectionSpacing: 6,
      columnIntensity: 1, columnWidth: "medium",
      showSectionIcons: false, showSectionSeparators: false, atsMode: false,
    },
    sections: [
      section("summary", "دربارهٔ من", 0),
      section("experience", "تجربهٔ کاری", 1),
      section("projects", "پروژه‌ها", 2),
      section("achievements", "دستاوردهای کلیدی", 3),
      section("certifications", "گواهی‌نامه‌ها", 4),
      section("education", "تحصیلات", 5),
      section("languages", "زبان‌ها", 6),
      section("skills", "مهارت‌ها", 7),
    ],
    personalInfo: {
      fullName: "محمدحسین رضایی", jobTitle: "توسعه‌دهندهٔ وب",
      phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹", location: "تهران، ایران", email: "rezaei.dev@gmail.com",
      dateOfBirth: "", nationality: "", militaryService: "",
      links: [{ id: id("l"), label: "وب‌سایت", url: "https://rezaei.dev" }],
      profileImage: null, uppercaseName: false, photoStyle: "round", imageSide: "left",
      fieldVisibility: { jobTitle: true, phone: true, links: true, email: true, location: true, photo: true, dateOfBirth: false, nationality: false, militaryService: false },
    },
    summary: { html: "<p>توسعه‌دهندهٔ وب حرفه‌ای با بیش از ۵ سال تجربه در طراحی و ساخت رابط‌های کاربری مدرن، سریع و مقیاس‌پذیر. متخصص در اکوسیستم React و TypeScript با تمرکز بر عملکرد، دسترس‌پذیری و تجربهٔ کاربری تمیز. فردی خلاق، منظم و مسئولیت‌پذیر که برای مسائل پیچیده راه‌حل‌های کاربردی پیدا می‌کند.</p>" },
    experience: [
      exp("توسعه‌دهندهٔ ارشد فرانت‌اند", "شرکت فناوری آسا", "2023-06-01", "", true, [
        "رهبری بازطراحی کامل داشبورد سازمانی با React و TypeScript",
        "پیاده‌سازی سیستم دیزاین و کتابخانهٔ کامپوننت مشترک بین تیم‌ها",
        "کاهش زمان بارگذاری تا ۴۰٪ با بهینه‌سازی رندر و بارگذاری تنبل",
        "هدایت فنی و بازبینی کد سه توسعه‌دهندهٔ جوان",
      ]),
      exp("توسعه‌دهندهٔ فرانت‌اند", "استارتاپ دیجی‌پی", "2021-06-01", "2023-06-01", false, [
        "توسعهٔ پنل کاربری و درگاه پرداخت با Next.js",
        "همکاری نزدیک با تیم طراحی برای بهبود تجربهٔ کاربری",
        "افزودن آزمون واحد و افزایش پوشش تست تا ۸۰٪",
        "یکپارچه‌سازی سرویس‌های شخص ثالث و APIها",
      ]),
      exp("توسعه‌دهندهٔ وب", "آژانس دیجیتال نوان", "2019-06-01", "2021-06-01", false, [
        "ساخت وب‌سایت‌های واکنش‌گرا برای مشتریان متنوع",
        "یکپارچه‌سازی APIها و بهینه‌سازی SEO و سرعت بارگذاری",
        "همکاری در تدوین استانداردهای کدنویسی تیم",
      ]),
      exp("کارآموز توسعهٔ وب", "شرکت داده‌پرداز", "2018-06-01", "2019-06-01", false, [
        "مشارکت در توسعهٔ کامپوننت‌های رابط کاربری و رفع خطا",
        "یادگیری فرایند توسعهٔ چابک و کنترل نسخه با Git",
      ]),
    ],
    skills: [{
      id: id("sk"), name: "", showTitle: false,
      skills: ["React", "TypeScript", "Next.js", "Node.js", "HTML / CSS", "Tailwind", "Git", "Redux", "Docker", "Figma"].map((n) => ({ id: id("k"), name: n, level: 4 })),
    }],
    education: [
      { id: id("edu"), degree: "کارشناسی ارشد نرم‌افزار", university: "دانشگاه صنعتی شریف", startDate: "2021-09-01", endDate: "2023-06-01", gpa: "", achievements: "", city: "" },
      { id: id("edu"), degree: "کارشناسی مهندسی کامپیوتر", university: "دانشگاه تهران", startDate: "2017-09-01", endDate: "2021-06-01", gpa: "", achievements: "", city: "" },
    ],
    projects: [
      { id: id("p"), name: "سامانهٔ مدیریت وظایف", role: "", link: "https://taskly.app", linkVisible: true, description: "اپ مدیریت پروژه با React و Node.js و همگام‌سازی بلادرنگ تیمی." },
      { id: id("p"), name: "کتابخانهٔ کامپوننت متن‌باز", role: "", link: "https://github.com/mhrezaei/ui-kit", linkVisible: true, description: "کامپوننت‌های React قابل‌استفادهٔ مجدد به‌همراه مستندات کامل." },
      { id: id("p"), name: "داشبورد تحلیلی فروش", role: "", link: "https://github.com/mhrezaei", linkVisible: true, description: "نمایش داده‌های فروش با نمودارهای تعاملی و خروجی گزارش PDF." },
      { id: id("p"), name: "وب‌سایت شخصی", role: "", link: "https://rezaei.dev", linkVisible: true, description: "ساخته‌شده با Next.js به‌همراه مقالات فنی دربارهٔ توسعهٔ وب." },
    ],
    languages: [
      { id: id("lang"), name: "فارسی", level: 5, showBars: false, showLevelText: true },
      { id: id("lang"), name: "انگلیسی", level: 4, showBars: false, showLevelText: true },
      { id: id("lang"), name: "آلمانی", level: 2, showBars: false, showLevelText: true },
    ],
    certifications: [
      { id: id("c"), name: "توسعهٔ حرفه‌ای React", issuer: "Frontend Masters", date: "2022-06-01" },
      { id: id("c"), name: "TypeScript پیشرفته", issuer: "مکتب‌خونه", date: "2021-06-01" },
      { id: id("c"), name: "اصول UX و طراحی رابط کاربری", issuer: "کوئرا کالج", date: "2020-06-01" },
    ],
    achievements: [
      { id: id("a"), title: "بهبود ۴۰٪ سرعت بارگذاری اپلیکیشن اصلی سازمان با بهینه‌سازی رندر و بارگذاری تنبل.", description: "" },
      { id: id("a"), title: "طراحی و ساخت سیستم دیزاین داخلی و کتابخانهٔ کامپوننت مشترک بین چند تیم.", description: "" },
      { id: id("a"), title: "منتورینگ و هدایت فنی سه توسعه‌دهندهٔ جوان و بازبینی مستمر کد تیم.", description: "" },
      { id: id("a"), title: "سخنرانی در دو رویداد داخلی دربارهٔ معماری فرانت‌اند و کیفیت کد.", description: "" },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(BASE, { waitUntil: "load" });
await page.evaluate((data) => {
  localStorage.clear();
  localStorage.setItem("ai-res:occupation-category", JSON.stringify({ id: "software-it", explicit: true }));
  localStorage.setItem("ai-res:resume", JSON.stringify(data));
}, fixture());
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector(".a4-page");
await page.waitForTimeout(800);

const report = await page.evaluate(() => {
  const PX_PER_MM = 96 / 25.4;
  const mm = (px) => +(px / PX_PER_MM).toFixed(1);
  const pages = [...document.querySelectorAll(".a4-page")];

  const pageReports = pages.map((pg) => {
    const pr = pg.getBoundingClientRect();
    // deepest visible content bottom (skip decorations, empty boxes, the page itself)
    let contentBottom = pr.top;
    let bottomEl = "";
    const walk = (el) => {
      for (const child of el.children) {
        if (child.hasAttribute?.("data-rz-decorations")) continue;
        const r = child.getBoundingClientRect();
        if (r.height === 0 || r.width === 0) continue;
        const cs = getComputedStyle(child);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        const paintsInk =
          (child.textContent ?? "").trim().length > 0 ||
          (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") ||
          child.tagName === "svg" || child.tagName === "IMG";
        if (paintsInk && r.bottom > contentBottom) {
          contentBottom = r.bottom;
          bottomEl = `${child.tagName}.${String(child.className).slice(0, 40)}`;
        }
        walk(child);
      }
    };
    walk(pg);
    // panel card = the direct tinted box (flex:1 with bg)
    const panel = [...pg.querySelectorAll("div")].find((d) => {
      const cs = getComputedStyle(d);
      return cs.borderRadius === "15px" && cs.backgroundColor !== "rgba(0, 0, 0, 0)";
    });
    const panelRect = panel ? panel.getBoundingClientRect() : null;
    // horizontal overflow inside the panel
    const overflows = [];
    if (panel) {
      for (const el of panel.querySelectorAll("*")) {
        if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
          overflows.push(`${el.tagName}.${String(el.className).slice(0, 30)} sw=${el.scrollWidth} cw=${el.clientWidth}`);
        }
      }
    }
    return {
      heightMm: mm(pr.height), widthMm: mm(pr.width),
      contentBottomGapMm: mm(pr.bottom - contentBottom),
      bottomEl,
      panel: panelRect
        ? { topGapMm: mm(panelRect.top - pr.top), bottomGapMm: mm(pr.bottom - panelRect.bottom), widthMm: mm(panelRect.width), bg: getComputedStyle(panel).backgroundColor }
        : null,
      panelOverflowCount: overflows.length,
      panelOverflowSample: overflows.slice(0, 6),
    };
  });

  // Computed styles of key elements on page 1
  const pg1 = pages[0];
  const style = (el, props) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return Object.fromEntries(props.map((p) => [p, cs[p]]));
  };
  const h2s = [...pg1.querySelectorAll("h2")].map((h) => ({
    text: (h.textContent ?? "").trim().slice(0, 20),
    ...style(h, ["fontSize", "fontWeight", "letterSpacing", "color", "lineHeight"]),
  }));
  const nameInput = [...pg1.querySelectorAll("input")].find((i) => i.value === "محمدحسین رضایی");
  const jobInput = [...pg1.querySelectorAll("input")].find((i) => i.value === "توسعه‌دهندهٔ وب");
  const railLines = [...pg1.querySelectorAll('[aria-hidden="true"]')].filter((el) => {
    const cs = getComputedStyle(el);
    return parseFloat(cs.width) < 3 && parseFloat(cs.height) > 20 && cs.position === "absolute";
  });
  const expTitle = [...pg1.querySelectorAll("input")].find((i) => i.value === "توسعه‌دهندهٔ ارشد فرانت‌اند");
  const bullets = [...pg1.querySelectorAll('[contenteditable="true"]')].slice(0, 2);
  const contactSpan = [...pg1.querySelectorAll("input")].find((i) => i.value === "rezaei.dev@gmail.com");

  return {
    pageCount: pages.length,
    pages: pageReports,
    h2s,
    name: style(nameInput, ["fontSize", "fontWeight", "lineHeight", "letterSpacing", "color"]),
    jobTitle: style(jobInput, ["fontSize", "fontWeight", "letterSpacing", "color"]),
    expTitle: style(expTitle, ["fontSize", "fontWeight", "letterSpacing", "color"]),
    bulletSample: bullets.map((b) => style(b, ["fontSize", "lineHeight", "color"])),
    contactEmail: style(contactSpan, ["fontSize", "color", "direction"]),
    railLineCount: railLines.length,
    railLines: railLines.slice(0, 8).map((r) => {
      const rect = r.getBoundingClientRect();
      return { wPx: +rect.width.toFixed(1), hPx: +rect.height.toFixed(1), bg: getComputedStyle(r).backgroundColor };
    }),
  };
});

console.log(JSON.stringify(report, null, 2));

for (let i = 0; i < report.pageCount; i++) {
  const el = page.locator(".a4-page").nth(i);
  await el.screenshot({ path: `scripts/${PREFIX}-p${i + 1}.png` });
}
console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors));
await browser.close();
