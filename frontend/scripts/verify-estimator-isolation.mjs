// Reads the temporary /__probe-isolation page, which computes every shared
// pagination estimator BOTH ways (current code with the new flags unset vs an
// independent transcription of the pre-change formulas) and reports mismatches.
//   node scripts/verify-estimator-isolation.mjs
import { chromium } from "playwright-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.SMOKE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(`${BASE}/probe-isolation`, { waitUntil: "networkidle" });
await page.waitForSelector("#probe-out", { timeout: 60000 });
const out = JSON.parse(await page.textContent("#probe-out"));

console.log(`checks: ${out.checks}`);
console.log(`mismatches: ${out.mismatchCount}`);
if (out.mismatchCount > 0) console.log(JSON.stringify(out.mismatches, null, 2));
if (errors.length) console.log("PAGE ERRORS:", JSON.stringify(errors.slice(0, 5)));
const ok = out.mismatchCount === 0 && out.checks > 1000 && errors.length === 0;
console.log("ESTIMATOR ISOLATION:", ok ? "PASS" : "FAIL");
await browser.close();
process.exit(ok ? 0 : 1);
