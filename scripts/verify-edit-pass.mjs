import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1200);

// Item 1: global scrollbar has no arrow buttons + thin modern thumb.
const scrollbar = await page.evaluate(() => {
  const sheets = [...document.styleSheets];
  let text = "";
  for (const s of sheets) {
    try { for (const r of s.cssRules) text += r.cssText; } catch {}
  }
  return {
    hidesButtons: /::-webkit-scrollbar-button[^{]*\{[^}]*display:\s*none/.test(text),
    hasThumb: /::-webkit-scrollbar-thumb/.test(text),
    ffThin: getComputedStyle(document.documentElement).scrollbarWidth,
  };
});
console.log("1 scrollbars  | hidesButtons:", scrollbar.hidesButtons, "| thumb:", scrollbar.hasThumb, "| ffThin:", scrollbar.ffThin);

// The design panel is open by default (activePanel:"design", not collapsed),
// so the sidebar + its style blocks already render — no click needed.
await page.waitForTimeout(700);

// Item 2: sidebar scroll region shows no scrollbar UI.
const sidebar = await page.evaluate(() => {
  const el = document.querySelector(".om-scroll");
  if (!el) return { found: false };
  const cs = getComputedStyle(el);
  return { found: true, ffWidth: cs.scrollbarWidth };
});
console.log("2 sidebar bar | found:", sidebar.found, "| scrollbarWidth:", sidebar.ffWidth);

// Item 4: custom-color entry is gone (no رنگ دلخواه text).
const customGone = (await page.locator("text=رنگ دلخواه").count()) === 0;
console.log("4 custom-color removed:", customGone);

// Item 5: each style block ends with an AdvertisingUi (3 fixed ids) + separators.
const ads = await page.evaluate(() => {
  const ids = [
    "pos-article-display-card-111793",
    "pos-article-display-111792",
    "pos-article-display-card-111952",
  ];
  return ids.map((id) => Boolean(document.getElementById(id)));
});
const separators = await page.evaluate(() => {
  const root = document.querySelector(".om-scroll");
  if (!root) return 0;
  return [...root.querySelectorAll("*")].filter((el) => {
    const r = getComputedStyle(el);
    return el.tagName === "HR" || el.getAttribute("role") === "separator" ||
      (r.borderTopStyle === "solid" && parseFloat(r.borderTopWidth) >= 1 && el.clientHeight <= 2 && el.clientWidth > 50);
  }).length;
});
console.log("5 block ads present:", ads, "| separators:", separators);

// Item 6: app underlay behind the page is white (workspace frame bg).
const underlay = await page.evaluate(() => {
  const page = document.querySelector(".a4-page");
  if (!page) return null;
  let el = page.parentElement;
  const bgs = [];
  while (el && bgs.length < 4) {
    bgs.push(getComputedStyle(el).backgroundColor);
    el = el.parentElement;
  }
  return bgs;
});
console.log("6 underlay bgs (page → up):", JSON.stringify(underlay));

// Item 8: switches render a thumb part (v3 compound API).
const thumbs = await page.locator('[data-scope="switch"][data-part="thumb"]').count();
const controls = await page.locator('[data-scope="switch"][data-part="control"]').count();
console.log("8 switch controls:", controls, "| thumbs:", thumbs);

await page.screenshot({ path: "scripts/edit-pass-design.png", fullPage: false });

// Item 3: responsive — at xl width the page should not sit under the panel.
const wide = await page.evaluate(() => {
  const panel = document.querySelector("aside"); // the visible 312px white panel
  const pageEl = document.querySelector(".a4-page");
  if (!panel || !pageEl) return null;
  const p = panel.getBoundingClientRect();
  const a = pageEl.getBoundingClientRect();
  // RTL: panel sits on the right; the page's right edge should clear it with room.
  const gap = Math.round(p.left - a.right);
  return { panelLeft: Math.round(p.left), pageRight: Math.round(a.right), gap, comfortable: gap >= 16 };
});
console.log("3 responsive (1500w) panelLeft/pageRight/gap/comfortable:", JSON.stringify(wide));

await browser.close();
