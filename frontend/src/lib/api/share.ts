import type { ResumeData } from "@/types";
import { apiJson } from "./client";

export interface PublicResume {
  resume: ResumeData;
  ownerName: string | null;
}

/** Public, unauthenticated read of a shared resume by token. */
export function getPublicResume(token: string): Promise<PublicResume> {
  return apiJson<PublicResume>(`/share/${token}`, { auth: false });
}
