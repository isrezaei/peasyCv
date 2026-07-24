// Backend API access for the verification scripts. The old unauthenticated
// Next `/api/pdf` route was removed (it bypassed the login-gated download), so
// PDF rendering now goes through the NestJS backend: register a throwaway user,
// then POST the full ResumeData to /pdf with a Bearer token. The backend DTO is
// strict (no normalize step), so callers must send complete ResumeData — use
// `defaultResume()` to get a server-seeded, DTO-valid document to build on.
const API = process.env.API_URL ?? "http://localhost:4000";

export async function createPdfClient() {
  const email = `verify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const registered = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "verify-pass-1234" }),
  });
  if (!registered.ok) {
    throw new Error(`backend register failed (${registered.status}): ${await registered.text()}`);
  }
  const { tokens } = await registered.json();
  const headers = {
    Authorization: `Bearer ${tokens.accessToken}`,
    "Content-Type": "application/json",
  };

  return {
    /** A complete, DTO-valid ResumeData seeded by the server (Persian defaults).
     *  `overrides` merges shallowly at the root, one level deep for `theme`. */
    async defaultResume(overrides = {}) {
      const created = await fetch(`${API}/resumes`, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
      if (!created.ok) {
        throw new Error(`create default resume failed (${created.status}): ${await created.text()}`);
      }
      const resume = await created.json();
      return { ...resume, ...overrides, theme: { ...resume.theme, ...(overrides.theme ?? {}) } };
    },

    /** Render a full ResumeData to a PDF Buffer via the backend POST /pdf. */
    async renderPdf(resume) {
      const res = await fetch(`${API}/pdf`, {
        method: "POST",
        headers,
        body: JSON.stringify(resume),
      });
      if (!res.ok) {
        throw new Error(`pdf render failed (${res.status}): ${await res.text()}`);
      }
      return Buffer.from(await res.arrayBuffer());
    },
  };
}
