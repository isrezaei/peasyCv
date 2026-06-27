import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(process.env.SMOKE_URL ?? "http://localhost:3000", { waitUntil: "load" });
await page.waitForTimeout(6000);

const BLOCK_IDS = [
  "pos-article-display-card-111793",
  "pos-article-display-111792",
  "pos-article-display-card-111952",
];
const filled = async () => {
  const r = await page.evaluate((ids) => ids.map((id) => {
    const el = document.getElementById(id);
    return el ? el.innerHTML.trim().length : -1;
  }), BLOCK_IDS);
  return r;
};
const allFilled = (arr) => arr.every((n) => n > 0);

console.log("first mount:", JSON.stringify(await filled()), "-> allFilled:", allFilled(await filled()));

// Repeat the panel round-trip several times; the design-block ads must RE-SHOW
// (non-empty) after every return, not just the first.
let pass = true;
for (let i = 1; i <= 3; i++) {
  await page.getByText("قالب‌ها", { exact: true }).first().click(); // templates (design ads unmount)
  await page.waitForTimeout(1000);
  await page.getByText("طراحی و فونت", { exact: true }).first().click(); // back to design (remount)
  await page.waitForTimeout(5000);
  const f = await filled();
  const ok = allFilled(f);
  pass = pass && ok;
  console.log(`round-trip #${i}:`, JSON.stringify(f), "-> reshown:", ok);
}

console.log("RESULT:", pass ? "PASS — ads re-show on every return" : "FAIL — a slot stayed empty");
console.log("CONSOLE_ERRORS:", JSON.stringify([...new Set(errors)]));
await browser.close();
process.exit(pass ? 0 : 1);
