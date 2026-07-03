import type { ResumeData } from "@/types";
import { apiFetch } from "./client";

/**
 * Request a server-rendered A4 PDF of the given resume from the backend (which
 * renders it via the frontend's /print route with Puppeteer). Returns the PDF
 * blob for the caller to trigger a download.
 */
export async function downloadResumePdf(resume: ResumeData): Promise<Blob> {
  const response = await apiFetch("/pdf", {
    method: "POST",
    body: JSON.stringify(resume),
  });
  if (!response.ok) {
    throw new Error(`PDF generation failed (${response.status})`);
  }
  return response.blob();
}
