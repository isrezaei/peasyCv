import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";

// ---------- WIDE (1400 → inline): items 1, 3, 4, 5 ----------
const wide = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await wide.goto(BASE, { waitUntil: "load" });
await wide.waitForTimeout(1500);

const inline = await wide.evaluate(() => {
  const aside = document.querySelector("aside");
  // Item 1: separators thin (≤1px) and light (low alpha).
  const seps = [...aside.querySelectorAll("*")].filter((el) => {
    const cs = getComputedStyle(el);
    return cs.borderTopStyle === "solid" && parseFloat(cs.borderTopWidth) > 0 &&
      el.clientHeight <= 2 && el.clientWidth > 80;
  }).map((el) => {
    const cs = getComputedStyle(el);
    return { thickness: cs.borderTopWidth, color: cs.borderTopColor };
  });
  // Item 5: each title has a muted helper line under it.
  const wanted = ["رنگ‌ها", "پس‌زمینه‌ها", "تنظیمات متن و اندازه‌ها"];
  const descs = ["رنگ اصلی", "طرح و نقش", "اندازهٔ فونت"];
  const text = aside.textContent || "";
  const descsPresent = descs.map((d) => text.includes(d));
  return { sepCount: seps.length, seps, descsPresent, titlesPresent: wanted.map((w) => text.includes(w)) };
});
console.log("ITEM1 separators:", JSON.stringify(inline.seps));
console.log("ITEM5 titles/descs present:", JSON.stringify(inline.titlesPresent), JSON.stringify(inline.descsPresent));

// Item 3: select a color → a check icon (svg) appears on the selected swatch, no ring.
await wide.getByRole("button", { name: "آبی آسمانی" }).click();
await wide.waitForTimeout(400);
const colorSel = await wide.evaluate(() => {
  const btn = [...document.querySelectorAll('aside button[aria-pressed="true"]')]
    .find((b) => b.offsetHeight < 40 && b.querySelector("svg")); // the small swatch pill
  if (!btn) return { found: false };
  const cs = getComputedStyle(btn);
  return {
    found: true,
    hasCheckSvg: !!btn.querySelector("svg"),
    boxShadow: cs.boxShadow === "none" ? "none" : "present-on-button",
  };
});
console.log("ITEM3 color selection:", JSON.stringify(colorSel));

// Item 4: select a background → only a check, no accent ring halo.
await wide.getByRole("button", { name: "Soft Blobs" }).click();
await wide.waitForTimeout(400);
const bgSel = await wide.evaluate(() => {
  const btn = document.querySelector('aside button[aria-pressed="true"][aria-label="Soft Blobs"]');
  if (!btn) return { found: false };
  const cs = getComputedStyle(btn);
  // The accent halo ring (SHADOWS.ring) contains "#71717a" / a 2px spread; the
  // hairline is rgba(0,0,0,0.08) 1px. Detect that the heavy ring is gone.
  const hasHeavyRing = /113, ?113, ?122/.test(cs.boxShadow) || /0px 0px 0px 2px/.test(cs.boxShadow);
  return { found: true, hasCheckSvg: !!btn.querySelector("svg"), hasHeavyRing, boxShadow: cs.boxShadow };
});
console.log("ITEM4 background selection:", JSON.stringify(bgSel));
await wide.close();

// ---------- NARROW (1100 ≤ lg → modal): item 2 RTL ----------
const lg = await browser.newPage({ viewport: { width: 1100, height: 900 } });
await lg.goto(BASE, { waitUntil: "load" });
await lg.waitForTimeout(1500);
const rtl = await lg.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]');
  if (!dlg) return { isDialog: false };
  const cs = getComputedStyle(dlg);
  // Walk up to find any explicit dir attribute on/around the dialog content.
  const dirAttr = dlg.closest("[dir]")?.getAttribute("dir") || dlg.getAttribute("dir");
  return { isDialog: true, direction: cs.direction, dirAttr };
});
console.log("ITEM2 modal RTL:", JSON.stringify(rtl));
await lg.screenshot({ path: "scripts/edit-pass5-modal.png" });
await lg.close();

await browser.close();
