import type { NextRequest } from "next/server";
import puppeteer from "puppeteer-core";
import { resolveChromeExecutable } from "@/lib/pdf/chromium";
import { normalizeResume } from "@/lib/resume/normalizeResume";
import type { ResumeData } from "@/types";

// Puppeteer needs the Node runtime (not the Edge runtime), and the response is
// always request-specific, so it must never be cached/prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RENDER_TIMEOUT_MS = 60_000;

/**
 * Renders the current resume to a true A4 PDF with Puppeteer. The resume payload
 * is injected into the `/print` route — which reuses the exact same rendering
 * layer as the live editor preview — so the PDF and the on-screen preview are
 * identical. Editor chrome and ad placeholders are hidden via the print
 * stylesheet (`.no-print` + `@media print`); page background colour, pattern,
 * font and chosen calendar all come through because the full theme is rendered.
 */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const resume = normalizeResume((payload as { resume?: Partial<ResumeData> })?.resume);
  const origin = request.nextUrl.origin;

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch({
      executablePath: resolveChromeExecutable(),
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Inject the resume before any document script runs so the /print route can
    // read it synchronously during hydration.
    await page.evaluateOnNewDocument((data: ResumeData) => {
      (window as unknown as { __RESUME_DATA__: ResumeData }).__RESUME_DATA__ = data;
    }, resume);

    await page.goto(`${origin}/print`, {
      waitUntil: "networkidle0",
      timeout: RENDER_TIMEOUT_MS,
    });

    // The print page flips this to "true" once the store is populated and the
    // web fonts have finished loading.
    await page.waitForSelector('[data-pdf-ready="true"]', { timeout: RENDER_TIMEOUT_MS });

    // page.pdf() already emulates print media; set it explicitly so .no-print
    // rules apply deterministically across Puppeteer versions.
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return new Response(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return Response.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
