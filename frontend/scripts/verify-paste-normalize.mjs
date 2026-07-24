import { chromium } from "playwright-core";

// Verifies the rich-text paste normalization (lib/richtext/paste.ts wired into
// RichTextField): pasting styled external HTML must land as the editor's own
// subset (text + strong/em/u + <br>) with no foreign fonts/sizes/styles, and a
// text/plain paste must keep its line breaks.

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

const BASE_URL = process.env.SMOKE_URL ?? "http://localhost:3000";
await page.goto(BASE_URL, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);

let failures = 0;
function check(name, ok, detail = "") {
  if (ok) console.log("OK:", name);
  else {
    failures += 1;
    console.log("FAIL:", name, detail ? `- ${detail}` : "");
  }
}

// The summary («درباره من») field is a RichTextField whose aria-label is its
// placeholder — the shared paste handler under test is the same for all fields.
const summary = page.locator('[role="textbox"][data-placeholder^="مثال: مهندس نرم"]');
await summary.waitFor({ timeout: 5000 });

async function pasteInto(locator, flavors) {
  await locator.click();
  await locator.evaluate((el, data) => {
    const dt = new DataTransfer();
    for (const [type, value] of Object.entries(data)) dt.setData(type, value);
    el.dispatchEvent(
      new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }),
    );
  }, flavors);
  await page.waitForTimeout(200);
}

// ---- 1. Google-Docs-shaped HTML: styled spans inside a bold-neutral wrapper ----
const docsHtml =
  '<meta charset="utf-8"><b style="font-weight:normal" id="docs-internal-guid-abc">' +
  '<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt">' +
  '<span style="font-size:14pt;font-family:Comic Sans MS,sans-serif;font-weight:400;letter-spacing:2px">Hello </span>' +
  '<span style="font-size:14pt;font-family:Comic Sans MS,sans-serif;font-weight:700">bold</span></p>' +
  '<p dir="ltr"><span style="font-style:italic;font-family:Georgia">second line</span></p></b>';

await pasteInto(summary, { "text/html": docsHtml, "text/plain": "Hello bold\nsecond line" });

let html = await summary.evaluate((el) => el.innerHTML);
console.log("after docs paste:", JSON.stringify(html));
check("no inline style attributes survive", !/style=/i.test(html), html);
check("no span/font wrappers survive", !/<(span|font)/i.test(html), html);
check("no id/class attributes survive", !/(id|class)=/i.test(html), html);
check("docs bold-neutral wrapper did not bold everything", !/^<strong>[\s\S]*<\/strong>$/.test(html.trim()), html);
check("styled bold span became <strong>", /<strong>bold<\/strong>/.test(html), html);
check("italic style became <em>", /<em>second line<\/em>/.test(html), html);
check("paragraphs became a line break", /<br>/.test(html), html);

// Pasted text must render with the field's own computed typography.
const typography = await summary.evaluate((el) => {
  const field = getComputedStyle(el);
  const strong = el.querySelector("strong");
  const mark = strong ? getComputedStyle(strong) : null;
  return {
    field: { family: field.fontFamily, size: field.fontSize, spacing: field.letterSpacing },
    mark: mark ? { family: mark.fontFamily, size: mark.fontSize, spacing: mark.letterSpacing } : null,
  };
});
check(
  "pasted text inherits the field font family/size/spacing",
  typography.mark !== null &&
    typography.mark.family === typography.field.family &&
    typography.mark.size === typography.field.size &&
    typography.mark.spacing === typography.field.spacing,
  JSON.stringify(typography),
);

// ---- 2. text/plain fallback keeps line breaks and escapes markup ----
await summary.evaluate((el) => (el.innerHTML = ""));
await pasteInto(summary, { "text/plain": "line one\nline <two> & three" });
html = await summary.evaluate((el) => el.innerHTML);
console.log("after plain paste:", JSON.stringify(html));
check("plain text kept its newline as <br>", /line one<br>/.test(html), html);
check("angle brackets were escaped, not parsed", /&lt;two&gt;/.test(html) && !/<two>/.test(html), html);

// ---- 3. the normalized value persists through the store (blur flush) ----
await page.keyboard.press("Escape");
await page.locator("body").click({ position: { x: 10, y: 10 } });
await page.waitForTimeout(1200);
const stored = await summary.evaluate((el) => el.innerHTML);
check("value survives blur/store round-trip", /line one<br>/.test(stored), stored);

check("no console errors", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();
console.log(failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
