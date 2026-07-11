/**
 * Normalizes a user-entered project URL at the commit point, before it reaches
 * the store — and therefore before it can reach any persisted payload or be
 * rendered as a live `href` on the public share view. Client-side this is a UX
 * affordance; the DTO's `@IsUrl` check on `ProjectItemDto.link` is the actual
 * security boundary. The two must stay aligned: any non-empty string this
 * returns must pass that validator.
 *
 * - `""` stays `""` (a project with no link).
 * - A bare host (`example.com`) is normalized to `https://example.com`.
 * - Anything that cannot be normalized to a plausible `http:`/`https:` URL —
 *   `javascript:`, `data:`, `vbscript:` and every other scheme included — is
 *   rejected by returning `""`, so no dangerous or malformed value is ever
 *   stored. The link row then simply shows its placeholder again.
 */
export function sanitizeProjectUrl(raw: string): string {
  const value = raw.trim();
  if (value === "") return "";

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
  const candidate = hasScheme ? value : `https://${value}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return "";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "";
  // Mirrors the backend validator's TLD requirement: a host without a dot is
  // not a plausible public link and would be rejected on save anyway.
  if (!url.hostname.includes(".")) return "";

  // The parsed serialization (encodes stray characters, lowercases the host)
  // is what is guaranteed to pass the backend's `@IsUrl`. `url.href` appends a
  // trailing slash to a bare origin ("example.com" → "https://example.com/");
  // drop it only when the path is exactly "/" with no query and no fragment, so
  // a bare host round-trips to "https://example.com" — still a valid @IsUrl
  // value. Anything with a path, search or hash keeps `url.href` verbatim,
  // percent-encoding included.
  if (url.pathname === "/" && url.search === "" && url.hash === "") {
    return url.href.slice(0, -1);
  }
  return url.href;
}
