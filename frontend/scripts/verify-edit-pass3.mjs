import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";

// ---------- ITEM 1: section order + titles (inline, wide xl=1400) ----------
const wide = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await wide.goto(BASE, { waitUntil: "load" });
await wide.waitForTimeout(1500);

const order = await wide.evaluate(() => {
  const aside = document.querySelector("aside");
  const titles = ["رنگ‌ها", "پس‌زمینه‌ها", "تنظیمات متن و اندازه‌ها"];
  const text = aside ? aside.textContent || "" : "";
  const positions = titles.map((tt) => text.indexOf(tt));
  return {
    inlineAside: !!aside,
    allTitlesPresent: positions.every((p) => p >= 0),
    inOrder: positions[0] >= 0 && positions[0] < positions[1] && positions[1] < positions[2],
    positions,
  };
});
console.log("ITEM1 (1400 inline):", JSON.stringify(order));

// ITEM 2: at xl (1400) the sidebar is INLINE (no dialog).
const wideNoDialog = await wide.evaluate(() => !document.querySelector('[role="dialog"]'));
console.log("ITEM2 (1400 → inline, no dialog):", wideNoDialog);
await wide.close();

// ---------- ITEM 2: at lg (1100 ≤ lg<xl) the sidebar is a MODAL ----------
const lg = await browser.newPage({ viewport: { width: 1100, height: 900 } });
await lg.goto(BASE, { waitUntil: "load" });
await lg.waitForTimeout(1500);

const modal = await lg.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]');
  if (!dlg) return { isDialog: false };
  const r = dlg.getBoundingClientRect();
  const cs = getComputedStyle(dlg);
  const radius = parseFloat(cs.borderTopLeftRadius) || 0;
  // ITEM 3: inset from ALL edges.
  const inset = {
    top: Math.round(r.top),
    bottom: Math.round(window.innerHeight - r.bottom),
    left: Math.round(r.left),
    right: Math.round(window.innerWidth - r.right),
  };
  const insetAllSides = inset.top > 4 && inset.bottom > 4 && inset.left > 4 && inset.right > 4;
  // ITEM 4: no close (X) button anywhere in the dialog.
  const closeBtns = dlg.querySelectorAll('[data-part="close-trigger"], [aria-label*="بستن"], button[aria-label*="Close"]');
  // titles present + ordered inside the modal too.
  const titles = ["رنگ‌ها", "پس‌زمینه‌ها", "تنظیمات متن و اندازه‌ها"];
  const text = dlg.textContent || "";
  const pos = titles.map((tt) => text.indexOf(tt));
  return {
    isDialog: true,
    radius,
    rounded: radius >= 8,
    inset,
    insetAllSides,
    noCloseButton: closeBtns.length === 0,
    titlesInOrder: pos.every((p) => p >= 0) && pos[0] < pos[1] && pos[1] < pos[2],
  };
});
console.log("ITEM2/3/4 (1100 modal):", JSON.stringify(modal));

// ITEM 4: click OUTSIDE (on the backdrop / top-left corner) closes the modal.
await lg.mouse.click(8, 8);
await lg.waitForTimeout(700);
const closedAfterOutside = await lg.evaluate(() => !document.querySelector('[role="dialog"]'));
console.log("ITEM4 click-outside closes:", closedAfterOutside);

// reopen via the topbar toggle (now interactive) to prove the toggle controls it.
const toggle = lg.locator('button[aria-expanded]').first();
await toggle.click();
await lg.waitForTimeout(700);
const reopened = await lg.evaluate(() => !!document.querySelector('[role="dialog"]'));
console.log("ITEM4 topbar toggle reopens:", reopened);

await lg.screenshot({ path: "scripts/edit-pass3-modal.png" });
await lg.close();
await browser.close();
