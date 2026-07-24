import type { BackgroundPatternId } from "@/types";

export interface BackgroundOption {
  id: BackgroundPatternId;
  /**
   * English display name, shown as a hover popover/tooltip on the thumbnail (and
   * used as its accessible name). The panel renders no caption under the swatch,
   * so this is the only place the pattern is named.
   */
  name: string;
  /**
   * Name for the same id's COLUMN pattern (the timeline-panel side column paints
   * a distinct geometric texture per id). Shown instead of {@link name} while a
   * column template is active, so the swatch is named after what it draws there.
   */
  columnName?: string;
  /**
   * Thumbnail viewport framing this pattern's busiest corner, so each swatch
   * shows a real preview of its own motif. The family anchors different corners,
   * so a single shared window would leave some thumbnails blank.
   */
  thumbViewBox: string;
}

export const backgroundOptions: BackgroundOption[] = [
  { id: "none", name: "None", columnName: "None", thumbViewBox: "114 -6 96 96" },
  { id: "blobs", name: "Soft Blobs", columnName: "Soft Blobs", thumbViewBox: "114 -6 96 96" },
  { id: "botanical", name: "Botanical", columnName: "Tri-Star", thumbViewBox: "118 -8 92 92" },
  { id: "bracketsRings", name: "Frame & Rings", columnName: "Cubes", thumbViewBox: "118 2 92 92" },
  { id: "chevronField", name: "Chevron", columnName: "Chevron", thumbViewBox: "78 18 92 92" },
  { id: "concentricArcs", name: "Concentric Arcs", columnName: "Hex Rings", thumbViewBox: "0 205 92 92" },
  { id: "dotGrid", name: "Dot Grid", columnName: "Hex Dash", thumbViewBox: "0 0 92 92" },
  { id: "topoLines", name: "Topo Lines", columnName: "Triangles", thumbViewBox: "40 150 108 108" },
];
