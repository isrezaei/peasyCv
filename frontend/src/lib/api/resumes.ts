import type { ResumeData, TemplateId } from "@/types";
import { apiFetch, apiJson } from "./client";

export interface ResumeSummary {
  id: string;
  title: string;
  templateId: TemplateId;
  updatedAt: string;
  createdAt: string;
}

export interface ShareLink {
  token: string;
  url: string;
  enabled: boolean;
}

/** The authenticated user's current (most recently updated) resume, or null. */
export function getCurrentResume(): Promise<ResumeData | null> {
  return apiJson<ResumeData | null>("/resumes/current");
}

export function listResumes(): Promise<ResumeSummary[]> {
  return apiJson<ResumeSummary[]>("/resumes");
}

/** Create-or-replace by id. Persists the whole ResumeData (autosave PUT). */
export function upsertResume(resume: ResumeData): Promise<ResumeData> {
  return apiJson<ResumeData>(`/resumes/${resume.id}`, {
    method: "PUT",
    body: JSON.stringify(resume),
  });
}

export async function deleteResume(id: string): Promise<void> {
  await apiFetch(`/resumes/${id}`, { method: "DELETE" });
}

export function getShareStatus(id: string): Promise<ShareLink> {
  return apiJson<ShareLink>(`/resumes/${id}/share`);
}

export function enableShare(id: string): Promise<ShareLink> {
  return apiJson<ShareLink>(`/resumes/${id}/share`, { method: "POST" });
}

export async function disableShare(id: string): Promise<void> {
  await apiFetch(`/resumes/${id}/share`, { method: "DELETE" });
}
