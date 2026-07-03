import type { ResumeData } from "@/types";

declare global {
  interface Window {
    /**
     * Resume payload injected by the Puppeteer PDF pipeline before the document
     * scripts run, consumed by the `/print` route to render the resume headless.
     */
    __RESUME_DATA__?: ResumeData;
  }
}

export {};
