import type { BackgroundPatternId } from "@/types";
import { mixWithWhite } from "@/lib/themes";
import { FamilyArtwork } from "./FamilyArtwork";

interface BackgroundLayerProps {
  pattern: BackgroundPatternId;
  /** Theme accent the single-hue family patterns recolour with. */
  accent: string;
  /** Mid-tone + soft tint used by the (kept) soft-bubbles motif. */
  base: string;
  soft: string;
  /**
   * Reserved for callers rendering several layers on one page. The family
   * patterns use no shared SVG ids, so it is no longer needed for uniqueness;
   * kept on the API so existing call sites stay valid.
   */
  idSuffix?: string;
  /** How the artwork maps into its box (full-bleed pages slice). */
  preserveAspectRatio?: string;
  /**
   * Viewport into the A4 artwork. Pages show the whole sheet; thumbnails pass a
   * zoomed window onto each pattern's busiest corner so the (deliberately
   * subtle) motif reads clearly at a small size instead of looking empty.
   */
  viewBox?: string;
  /**
   * Overall opacity multiplier (the «شدت پس‌زمینه» control). Applied as a single
   * group opacity over the whole motif, so it scales every element uniformly and
   * preserves each pattern's internal opacity relationships. Defaults to 1 (used
   * by the thumbnails, which always show the motif at full strength for clarity).
   */
  intensity?: number;
}

/**
 * Renders the decorative page background as a single full-bleed SVG layer.
 * "Soft bubbles" keeps its original pastel-tint look; every other motif comes
 * from the imported "Resume Pattern Family", drawn corner-anchored from a single
 * theme hue at low opacity — print-safe, with a clear central text zone. Pure
 * SVG (no filters/blur) keeps the browser preview identical to the headless PDF.
 */
export function BackgroundLayer({
  pattern,
  accent,
  base,
  soft,
  preserveAspectRatio = "xMidYMid slice",
  viewBox = "0 0 210 297",
  intensity = 1,
}: BackgroundLayerProps) {
  if (pattern === "none") return null;

  const light = mixWithWhite(base, 0.4);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {/* One group opacity scales the entire motif uniformly (lighter ↔ stronger)
          while keeping every element's relative opacity intact. */}
      <g opacity={intensity}>
        {pattern === "blobs" ? (
          <g>
            <circle cx="205" cy="-6" r="60" fill={base} opacity="0.32" />
            <circle cx="186" cy="26" r="30" fill={soft} opacity="0.8" />
            <circle cx="6" cy="300" r="58" fill={base} opacity="0.22" />
            <circle cx="30" cy="285" r="26" fill={light} opacity="0.6" />
          </g>
        ) : (
          <FamilyArtwork pattern={pattern} accent={accent} />
        )}
      </g>
    </svg>
  );
}
