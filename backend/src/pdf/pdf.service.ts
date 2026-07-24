import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer-core';
import type { ResumeData } from '@resume/types';
import type { AppConfig } from '../config/configuration';
import { resolveChromeExecutable } from './chromium';

/**
 * Renders a resume to a true A4 PDF by driving Puppeteer over the FRONTEND's
 * /print route — the exact same React render layer as the live editor preview.
 * The resume is injected on window.__RESUME_DATA__ before any script runs (the
 * /print page hydrates from it), editor chrome/ads are hidden by the print
 * stylesheet, and the page signals readiness via [data-pdf-ready="true"]. So the
 * downloaded PDF is identical to the on-screen preview.
 */
@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async renderResumePdf(resume: ResumeData): Promise<Buffer> {
    const pdfConfig = this.config.get('pdf', { infer: true });
    const frontendUrl = pdfConfig.frontendUrl;
    const executablePath = resolveChromeExecutable(pdfConfig.executablePath);
    const timeout = pdfConfig.renderTimeoutMs;

    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
    try {
      browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      // Inject before document scripts so /print reads it synchronously on hydrate.
      await page.evaluateOnNewDocument((data: ResumeData) => {
        (window as unknown as { __RESUME_DATA__: ResumeData }).__RESUME_DATA__ = data;
      }, resume);

      await page.goto(`${frontendUrl.replace(/\/$/, '')}/print`, {
        waitUntil: 'networkidle0',
        timeout,
      });

      // Flips to "true" once the store is populated and web fonts have settled.
      await page.waitForSelector('[data-pdf-ready="true"]', { timeout });
      await page.emulateMediaType('print');

      const pdf = await page.pdf({
        format: 'a4',
        printBackground: true,
        preferCSSPageSize: true,
      });

      return Buffer.from(pdf);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown PDF render error.';
      this.logger.error(`PDF render failed: ${message}`);
      throw new InternalServerErrorException(`PDF generation failed: ${message}`);
    } finally {
      await browser?.close();
    }
  }
}
