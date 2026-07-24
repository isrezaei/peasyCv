import { apiFetch, apiJson } from "./client";

export interface AdminSummary {
  users: number;
  resumes: number;
  downloads: number;
}

export interface DailyCount {
  date: string; // UTC day "YYYY-MM-DD"
  count: number;
}

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  occupation: string | null;
  createdAt: string;
  resumeCount: number;
}

/** A design dimension whose per-option selections/downloads are charted. */
export type SelectionKind = "background" | "theme" | "template" | "font";

export interface SelectionOptionCount {
  value: string;
  selections: number;
  downloads: number;
}

export interface OccupationCount {
  occupation: string; // id, or "unspecified"
  count: number;
}

export interface AdminUsersPage {
  total: number;
  page: number;
  pageSize: number;
  users: AdminUserRow[];
}

export function getAdminSummary(): Promise<AdminSummary> {
  return apiJson<AdminSummary>("/admin/stats/summary");
}

export function getAdminVisits(from?: string, to?: string): Promise<DailyCount[]> {
  return apiJson<DailyCount[]>(`/admin/stats/visits${rangeQuery(from, to)}`);
}

export function getAdminDownloads(from?: string, to?: string): Promise<DailyCount[]> {
  return apiJson<DailyCount[]>(`/admin/stats/downloads${rangeQuery(from, to)}`);
}

export function getAdminUsers(page: number, pageSize = 20): Promise<AdminUsersPage> {
  return apiJson<AdminUsersPage>(`/admin/users?page=${page}&pageSize=${pageSize}`);
}

export function getAdminSelections(
  kind: SelectionKind,
  from?: string,
  to?: string,
): Promise<SelectionOptionCount[]> {
  const params = new URLSearchParams({ kind });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiJson<SelectionOptionCount[]>(`/admin/stats/selections?${params.toString()}`);
}

export function getAdminOccupations(): Promise<OccupationCount[]> {
  return apiJson<OccupationCount[]>("/admin/stats/occupations");
}

/** Anonymous daily visit beacon — fire-and-forget, no auth header needed. */
export function recordVisit(visitorId: string): Promise<Response> {
  return apiFetch("/visits", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ visitorId }),
  });
}

/** Anonymous design-selection beacon — fire-and-forget, no auth header needed. */
export function recordSelection(kind: SelectionKind, value: string): Promise<Response> {
  return apiFetch("/selections", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ kind, value }),
  });
}

function rangeQuery(from?: string, to?: string): string {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return query ? `?${query}` : "";
}
