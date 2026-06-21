import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

// 12 — Kalameh applied to UI text.
const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);

// 11 — app accent resolves to Chakra cyan (cyan.600 = rgb(8,145,178),
// cyan.700 = rgb(12,92,114)). Resolve the semantic vars via a probe element.
const accent = await page.evaluate(() => {
  const probe = document.createElement("div");
  probe.style.color = "var(--chakra-colors-accent-solid)";
  document.body.appendChild(probe);
  const solid = getComputedStyle(probe).color;
  probe.style.color = "var(--chakra-colors-accent-fg)";
  const fg = getComputedStyle(probe).color;
  probe.remove();
  return { solid, fg };
});

// 2 — modern scrollbar rules are present in a global stylesheet, with no
// arrow buttons (scrollbar-button: display none).
const scrollbar = await page.evaluate(() => {
  let text = "";
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) text += rule.cssText + "\n";
    } catch {
      /* cross-origin sheet — skip */
    }
  }
  return {
    hasThumb: /::-webkit-scrollbar-thumb/.test(text),
    hidesButtons: /::-webkit-scrollbar-button[^{]*\{[^}]*display:\s*none/.test(text),
    firefoxThin: getComputedStyle(document.documentElement).scrollbarWidth,
  };
});

// 1 — neutral semantic tokens resolve (fg.muted / bg.subtle / border.emphasized).
const neutrals = await page.evaluate(() => {
  const probe = document.createElement("div");
  document.body.appendChild(probe);
  const read = (v) => {
    probe.style.color = `var(${v})`;
    return getComputedStyle(probe).color;
  };
  const out = {
    fgMuted: read("--chakra-colors-fg-muted"),
    bgSubtle: read("--chakra-colors-bg-subtle"),
    borderEmphasized: read("--chakra-colors-border-emphasized"),
  };
  probe.remove();
  return out;
});

console.log("12 body font-family :", bodyFont);
console.log("11 accent.solid     :", accent.solid, "(expect rgb(8, 145, 178))");
console.log("11 accent.fg        :", accent.fg, "(expect rgb(12, 92, 114))");
console.log("2  scrollbar thumb  :", scrollbar.hasThumb, "| hides buttons:", scrollbar.hidesButtons, "| ff width:", scrollbar.firefoxThin);
console.log("1  fg.muted         :", neutrals.fgMuted);
console.log("1  bg.subtle        :", neutrals.bgSubtle);
console.log("1  border.emphasized:", neutrals.borderEmphasized);

// Hover the profile photo so the cyan camera (colorPalette="accent") shows.
await page.mouse.move(750, 500);
await page.waitForTimeout(300);
await page.screenshot({ path: "scripts/s1-verify.png", fullPage: false });

await browser.close();
