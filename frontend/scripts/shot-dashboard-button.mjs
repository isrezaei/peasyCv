/** One-off: confirm the «رزومه جدید» pill renders as a flat monochrome pill. */
import { chromium } from "playwright-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const run = async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const reg = await (
    await fetch("http://localhost:4000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `occ-shot-${Date.now()}@test.local`, password: "S3curePass!x" }),
    })
  ).json();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 500 } })).newPage();
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([a, r]) => {
      localStorage.setItem("ai-res:accessToken", a);
      localStorage.setItem("ai-res:refreshToken", r);
    },
    [reg.tokens.accessToken, reg.tokens.refreshToken],
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText("رزومه‌های من").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);
  const btn = page.getByRole("button", { name: /رزومه جدید/ });
  const styles = await btn.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, image: cs.backgroundImage, shadow: cs.boxShadow };
  });
  console.log(JSON.stringify(styles));
  await page.screenshot({ path: "scripts/out-occupation/dashboard-header-fixed.png" });
  await browser.close();
};
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
