import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";

// ---------- WIDE (1500): inline sidebar, no scrollbars, holder clips ----------
const wide = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
await wide.goto(BASE, { waitUntil: "load" });
await wide.waitForTimeout(1500);

const wideChecks = await wide.evaluate(() => {
  // Item 4: above md → inline panel (an <aside>), NOT a dialog.
  const aside = document.querySelector("aside");
  const dialog = document.querySelector('[role="dialog"]');
  // Item 2: no visible scrollbar gutter on any scroll container.
  const scrollers = [...document.querySelectorAll("*")].filter((el) => {
    const cs = getComputedStyle(el);
    return /(auto|scroll)/.test(cs.overflowY + cs.overflowX);
  });
  const maxGutter = scrollers.reduce((m, el) => {
    const g = Math.max(el.offsetWidth - el.clientWidth, el.offsetHeight - el.clientHeight);
    return Math.max(m, g);
  }, 0);
  // Item 3: the page-holder (parent chain of .a4-page) has an overflow:hidden frame.
  let holderHidden = false;
  let el = document.querySelector(".a4-page")?.parentElement || null;
  while (el) {
    if (getComputedStyle(el).overflow === "hidden") { holderHidden = true; break; }
    el = el.parentElement;
  }
  // Item 3: nothing escapes — document has no horizontal scroll.
  const noHScroll = document.documentElement.scrollWidth <= window.innerWidth + 1;
  return {
    inlineAside: Boolean(aside),
    noDialog: !dialog,
    scrollerCount: scrollers.length,
    maxGutter,
    holderHidden,
    noHScroll,
  };
});
console.log("WIDE 1500:", JSON.stringify(wideChecks));
await wide.close();

// ---------- NARROW (700 ≤ md): sidebar is a MODAL, toggled from topbar ----------
const narrow = await browser.newPage({ viewport: { width: 700, height: 900 } });
await narrow.goto(BASE, { waitUntil: "load" });
await narrow.waitForTimeout(1500);

const modalOpen = await narrow.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]');
  const backdrop = !!document.querySelector('[data-scope="dialog"][data-part="backdrop"]');
  // A known sidebar control should be inside the modal (page-margin slider label).
  const hasContent = !!dlg && /حاشیه صفحه|رنگ‌ها|قالب/.test(dlg.textContent || "");
  return { isDialog: !!dlg, backdrop, hasContent };
});
console.log("NARROW 700 (default open):", JSON.stringify(modalOpen));

// While modal: Esc closes it (a standard modal affordance) and syncs the shared
// collapse flag. Then the now-interactive TOPBAR toggle re-opens it — proving the
// same flag/toggle controls the modal.
await narrow.keyboard.press("Escape");
await narrow.waitForTimeout(700);
const afterClose = await narrow.evaluate(() => !!document.querySelector('[role="dialog"]'));
const toggle = narrow.locator('button[aria-expanded]').first();
await toggle.click();
await narrow.waitForTimeout(700);
const afterReopen = await narrow.evaluate(() => !!document.querySelector('[role="dialog"]'));
console.log("NARROW close(Esc) ->", !afterClose, "| reopen(topbar toggle) ->", afterReopen);

// No visible scrollbar in the modal body either.
const narrowGutter = await narrow.evaluate(() => {
  const scrollers = [...document.querySelectorAll("*")].filter((el) => {
    const cs = getComputedStyle(el);
    return /(auto|scroll)/.test(cs.overflowY + cs.overflowX);
  });
  return scrollers.reduce((m, el) => Math.max(m, el.offsetWidth - el.clientWidth, el.offsetHeight - el.clientHeight), 0);
});
console.log("NARROW max scrollbar gutter:", narrowGutter);
await narrow.screenshot({ path: "scripts/edit-pass2-modal.png" });
await narrow.close();

await browser.close();
