import type { BackgroundPatternId } from "@/types";
import { mixWithWhite } from "@/lib/themes";

interface BackgroundLayerProps {
  pattern: BackgroundPatternId;
  accent: string;
  base: string;
  soft: string;
  /** Unique suffix so multiple pages/thumbnails don't share SVG <defs> ids. */
  idSuffix: string;
  /** How the artwork maps into its box (full-bleed pages slice). */
  preserveAspectRatio?: string;
  /**
   * Viewport into the A4 artwork. Pages show the whole sheet; thumbnails pass a
   * zoomed top-corner window so the (deliberately subtle) motif reads clearly at
   * a small size instead of looking empty.
   */
  viewBox?: string;
}

/**
 * Renders the decorative page background as a single full-bleed SVG layer.
 * Every pattern is a soft, pastel, corner-anchored motif drawn from the theme's
 * light tints at low opacity — print-safe, never crossing the content area, and
 * visually consistent across the whole set. Pure SVG (no filters/blur) keeps the
 * browser preview identical to a future headless PDF render.
 */
export function BackgroundLayer({
  pattern,
  accent,
  base,
  soft,
  idSuffix,
  preserveAspectRatio = "xMidYMid slice",
  viewBox = "0 0 210 297",
}: BackgroundLayerProps) {
  if (pattern === "none") return null;

  const light = mixWithWhite(base, 0.4);
  const lightAccent = mixWithWhite(accent, 0.55);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {pattern === "blobs" ? (
        <g>
          <circle cx="205" cy="-6" r="60" fill={base} opacity="0.32" />
          <circle cx="186" cy="26" r="30" fill={soft} opacity="0.8" />
          <circle cx="6" cy="300" r="58" fill={base} opacity="0.22" />
          <circle cx="30" cy="285" r="26" fill={light} opacity="0.6" />
        </g>
      ) : null}

      {pattern === "hexLines" ? (
        <>
          <defs>
            <pattern id={`hex-${idSuffix}`} width="16" height="28" patternUnits="userSpaceOnUse">
              <path
                d="M8 0 L16 4.5 L16 13.5 L8 18 L0 13.5 L0 4.5 Z"
                fill="none"
                stroke={base}
                strokeWidth="0.45"
                opacity="0.55"
              />
            </pattern>
          </defs>
          <rect x="138" y="-6" width="78" height="78" fill={`url(#hex-${idSuffix})`} opacity="0.7" />
          <rect x="-6" y="232" width="54" height="60" fill={`url(#hex-${idSuffix})`} opacity="0.45" />
        </>
      ) : null}

      {pattern === "topographic" ? (
        <g fill="none" stroke={base} strokeWidth="0.4" opacity="0.32">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={i} cx="182" cy="34" rx={16 + i * 12} ry={11 + i * 9} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={`b${i}`} cx="22" cy="274" rx={12 + i * 11} ry={9 + i * 8} />
          ))}
        </g>
      ) : null}

      {pattern === "halftone" ? (
        <>
          <defs>
            <pattern id={`dot-${idSuffix}`} width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill={base} />
            </pattern>
          </defs>
          <rect x="150" y="-4" width="64" height="70" fill={`url(#dot-${idSuffix})`} opacity="0.5" />
          <rect x="-4" y="236" width="58" height="64" fill={`url(#dot-${idSuffix})`} opacity="0.32" />
        </>
      ) : null}

      {pattern === "chevron" ? (
        <>
          <defs>
            <pattern id={`chev-${idSuffix}`} width="13" height="9" patternUnits="userSpaceOnUse">
              <path d="M0 8 L6.5 1 L13 8" fill="none" stroke={base} strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          <rect x="132" y="-4" width="84" height="40" fill={`url(#chev-${idSuffix})`} opacity="0.7" />
          <rect x="-4" y="262" width="78" height="38" fill={`url(#chev-${idSuffix})`} opacity="0.45" />
        </>
      ) : null}

      {pattern === "corner-brackets" ? (
        <g fill="none" stroke={base} strokeWidth="0.9" opacity="0.5">
          <circle cx="190" cy="18" r="7" />
          <circle cx="178" cy="30" r="3.5" fill={base} stroke="none" opacity="0.6" />
          <path d="M196 34 L196 46 L184 46" />
          <circle cx="20" cy="280" r="6" />
          <path d="M14 262 L14 250 L26 250" />
        </g>
      ) : null}

      {pattern === "rainbow-corner" ? (
        <g opacity="0.85">
          <path d="M210 0 A74 74 0 0 1 136 74 L210 74 Z" fill={soft} />
          <path d="M210 0 A56 56 0 0 1 154 56 L210 56 Z" fill={light} />
          <path d="M210 0 A38 38 0 0 1 172 38 L210 38 Z" fill={base} />
          <path d="M210 0 A20 20 0 0 1 190 20 L210 20 Z" fill={lightAccent} />
          <path d="M0 297 A30 30 0 0 1 30 267 L30 297 Z" fill={light} opacity="0.7" />
        </g>
      ) : null}
    </svg>
  );
}
