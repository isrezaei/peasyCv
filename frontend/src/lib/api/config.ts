/**
 * Base URL of the NestJS backend. Configured at build time via
 * NEXT_PUBLIC_API_URL (see frontend/.env.example); defaults to the local dev API.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");
