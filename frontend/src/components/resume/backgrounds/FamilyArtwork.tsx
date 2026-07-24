import type { BackgroundPatternId } from "@/types";
import {
  BOTANICAL,
  BOTANICAL_OPACITY,
  BRACKET_PATH,
  BRACKETS_MARKS,
  BRACKETS_OPACITY,
  BRACKETS_RINGS,
  CHEVRON_FIELD,
  COLUMN_CHEVRON,
  COLUMN_CUBES,
  COLUMN_HEX_RING_DOTS,
  COLUMN_HEX_RINGS,
  COLUMN_HEXDASH,
  COLUMN_TRIANGLES,
  COLUMN_TRISTAR,
  CONCENTRIC_ARCS,
  DOT_GRID,
  TOPO_LINES,
} from "@/lib/backgrounds/patternGeometry";

interface FamilyArtworkProps {
  pattern: BackgroundPatternId;
  /** Single theme hue every motif recolours with. */
  accent: string;
  /**
   * COLUMN variant: the tall-narrow, densely-tiled version of each motif, for
   * the timeline-panel side column (see the column datasets in patternGeometry).
   * Unset renders the corner-anchored A4 artwork the full-page backgrounds use.
   */
  column?: boolean;
}

/**
 * The "Resume Pattern Family" motifs (design source of truth). Each is
 * corner-anchored and drawn in one theme hue via `currentColor` at the design's
 * opacities, so they recolour with the user's accent. Pure SVG (no filters/defs)
 * keeps the browser preview and the Puppeteer PDF identical.
 */
export function FamilyArtwork({ pattern, accent, column }: FamilyArtworkProps) {
  if (column) return <ColumnArtwork pattern={pattern} accent={accent} />;
  switch (pattern) {
    case "botanical":
      return (
        <g style={{ color: accent }}>
          {BOTANICAL.blobs.map((b, i) => (
            <ellipse key={`b${i}`} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill="currentColor" fillOpacity={BOTANICAL_OPACITY.blob} />
          ))}
          {BOTANICAL.stems.map((d, i) => (
            <path key={`s${i}`} d={d} fill="none" stroke="currentColor" strokeOpacity={BOTANICAL_OPACITY.stem} strokeWidth={0.6} strokeLinecap="round" />
          ))}
          {BOTANICAL.leaves.map((lf, i) => (
            <g key={`l${i}`} fill="none" stroke="currentColor" strokeOpacity={BOTANICAL_OPACITY.leaf}>
              <path d={lf.outline} strokeWidth={0.6} strokeLinejoin="round" />
              <path d={lf.mid} strokeWidth={0.45} />
            </g>
          ))}
          {BOTANICAL.sdots.map((d, i) => (
            <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} fill="currentColor" fillOpacity={BOTANICAL_OPACITY.dot} />
          ))}
        </g>
      );
    case "bracketsRings":
      return (
        <g style={{ color: accent }} fill="none" stroke="currentColor" strokeWidth={1} strokeOpacity={BRACKETS_OPACITY} strokeLinecap="round">
          {BRACKETS_MARKS.map((m, i) => (
            <path key={`m${i}`} d={BRACKET_PATH} transform={`translate(${m.x} ${m.y}) rotate(${m.rot})`} />
          ))}
          {BRACKETS_RINGS.map((r, i) => (
            <circle key={`r${i}`} cx={r.x} cy={r.y} r={r.r} />
          ))}
        </g>
      );
    case "chevronField":
      return (
        <g style={{ color: accent }} fill="none" stroke="currentColor" strokeWidth={0.7} strokeLinecap="round" strokeLinejoin="round">
          {CHEVRON_FIELD.map((c, i) => (
            <path key={i} d={c.d} strokeOpacity={c.o} />
          ))}
        </g>
      );
    case "concentricArcs":
      return (
        <g style={{ color: accent }} fill="none" stroke="currentColor" strokeWidth={0.7}>
          {CONCENTRIC_ARCS.map((a, i) => (
            <path key={i} d={a.d} strokeOpacity={a.o} />
          ))}
        </g>
      );
    case "dotGrid":
      return (
        <g style={{ color: accent }} fill="currentColor">
          {DOT_GRID.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fillOpacity={d.o} />
          ))}
        </g>
      );
    case "topoLines":
      return (
        <g style={{ color: accent }} fill="none" stroke="currentColor" strokeWidth={0.7}>
          {TOPO_LINES.map((t, i) => (
            <path key={i} d={t.d} strokeOpacity={t.o} />
          ))}
        </g>
      );
    default:
      return null;
  }
}

/**
 * The COLUMN patterns: modern geometric tiles authored across the whole
 * tall-narrow COLUMN_VIEW so they cover the entire timeline-panel column (see
 * the column datasets in patternGeometry). Each is a flat array of path strings
 * stroked in the single `currentColor` hue at one uniform opacity — same
 * pure-SVG (no defs/filters) policy as the page artwork above. The A4 pattern id
 * chosen in the picker maps onto the matching geometric texture here.
 */
const COLUMN_STROKE_OPACITY = 0.85;

function ColumnArtwork({ pattern, accent }: { pattern: BackgroundPatternId; accent: string }) {
  switch (pattern) {
    // Chevron — continuous zigzag stripes.
    case "chevronField":
      return (
        <g style={{ color: accent }} fill="none" stroke="currentColor" strokeOpacity={COLUMN_STROKE_OPACITY} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
          {COLUMN_CHEVRON.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      );
    // Hexagon + dash mosaic.
    case "dotGrid":
      return (
        <g style={{ color: accent }} fill="none" stroke="currentColor" strokeOpacity={COLUMN_STROKE_OPACITY} strokeWidth={1} strokeLinejoin="round" strokeLinecap="round">
          {COLUMN_HEXDASH.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      );
    // Nested hexagons — concentric hex rings around a solid centre.
    case "concentricArcs":
      return (
        <g style={{ color: accent }}>
          <g fill="none" stroke="currentColor" strokeOpacity={COLUMN_STROKE_OPACITY} strokeWidth={0.9} strokeLinejoin="round">
            {COLUMN_HEX_RINGS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g fill="currentColor" fillOpacity={COLUMN_STROKE_OPACITY}>
            {COLUMN_HEX_RING_DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} />
            ))}
          </g>
        </g>
      );
    // Nested isometric cubes.
    case "bracketsRings":
      return (
        <g style={{ color: accent }} fill="none" stroke="currentColor" strokeOpacity={COLUMN_STROKE_OPACITY} strokeWidth={0.9} strokeLinejoin="round">
          {COLUMN_CUBES.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      );
    // Triangle grid with trisected inner triangles.
    case "topoLines":
      return (
        <g style={{ color: accent }} fill="none" stroke="currentColor" strokeOpacity={COLUMN_STROKE_OPACITY} strokeWidth={0.9} strokeLinejoin="round">
          {COLUMN_TRIANGLES.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      );
    // Tri-star — three-pronged "Y" field.
    case "botanical":
      return (
        <g style={{ color: accent }} fill="none" stroke="currentColor" strokeOpacity={COLUMN_STROKE_OPACITY} strokeWidth={1.1} strokeLinecap="round">
          {COLUMN_TRISTAR.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      );
    default:
      return null;
  }
}
