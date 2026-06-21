import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

await page.goto("http://localhost:3000", { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(700);

const log = (...a) => console.log(...a);

// 1) Header + experience default view
await page.screenshot({ path: "scripts/s2-01-default.png", fullPage: true });

// 2) Personal-info gear popover: open, then verify it closes on outside click.
const name = page.getByPlaceholder("مثال: علی محمدی");
await name.hover();
await page.getByRole("button", { name: "فیلد‌ها" }).first().click();
await page.waitForTimeout(300);
const popoverOpen = await page.getByText("نام با حروف بزرگ").isVisible().catch(() => false);
log("popover opened:", popoverOpen);
await page.screenshot({ path: "scripts/s2-02-header-popover.png" });
// Outside click should close it.
await page.mouse.click(1200, 850);
await page.waitForTimeout(300);
const stillOpen = await page.getByText("نام با حروف بزرگ").isVisible().catch(() => false);
log("popover still open after outside click:", stillOpen);

// 3) Arrangement panel (switch away from the default design panel first)
await page.getByText("چینش بخش‌ها", { exact: true }).first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: "scripts/s2-05-rearrange.png" });

// 4) Design panel (colors borderless, custom color, backgrounds preview, no font dropdown)
await page.getByText("طراحی و فونت", { exact: true }).first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: "scripts/s2-03-design-panel.png" });

// 5) Open custom color picker
await page.getByText("استفاده از رنگ دلخواه").click();
await page.waitForTimeout(400);
await page.screenshot({ path: "scripts/s2-04-color-picker.png" });
await page.keyboard.press("Escape");
await page.waitForTimeout(200);

// 6) Collapse the floating sidebar
await page.getByRole("button", { name: "بستن پنل" }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: "scripts/s2-06-collapsed.png" });
const expandVisible = await page.getByRole("button", { name: "باز کردن پنل" }).isVisible();
log("collapsed -> expand button visible:", expandVisible);
await page.getByRole("button", { name: "باز کردن پنل" }).click();
await page.waitForTimeout(300);

// 7) Sidebar (colored side column) template
await page.getByText("قالب‌ها", { exact: true }).first().click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "ستون رنگی کناری" }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: "scripts/s2-07-sidebar-template.png", fullPage: true });

// 8) Section gear popover (per-section direction control)
await page.getByText("تک‌ستونه حرفه‌ای").click();
await page.waitForTimeout(500);
const heading = page.getByRole("heading", { name: "تجربه کاری" }).first();
await heading.hover();
await page.waitForTimeout(200);
await page.getByRole("button", { name: "تنظیمات بخش" }).first().click();
await page.waitForTimeout(300);
const dirVisible = await page.getByText("جهت متن").isVisible().catch(() => false);
log("section gear shows direction control:", dirVisible);
await page.screenshot({ path: "scripts/s2-08-section-gear.png" });

log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors, null, 2));
await browser.close();
