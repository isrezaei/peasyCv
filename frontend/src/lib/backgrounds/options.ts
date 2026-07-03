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
   * Thumbnail viewport framing this pattern's busiest corner, so each swatch
   * shows a real preview of its own motif. The family anchors different corners,
   * so a single shared window would leave some thumbnails blank.
   */
  thumbViewBox: string;
}

export const backgroundOptions: BackgroundOption[] = [
  { id: "none", name: "None", thumbViewBox: "114 -6 96 96" },
  { id: "blobs", name: "Soft Blobs", thumbViewBox: "114 -6 96 96" },
  { id: "botanical", name: "Botanical", thumbViewBox: "118 -8 92 92" },
  { id: "bracketsRings", name: "Frame & Rings", thumbViewBox: "118 2 92 92" },
  { id: "chevronField", name: "Chevron", thumbViewBox: "78 18 92 92" },
  { id: "concentricArcs", name: "Concentric Arcs", thumbViewBox: "0 205 92 92" },
  { id: "dotGrid", name: "Dot Grid", thumbViewBox: "0 0 92 92" },
  { id: "topoLines", name: "Topo Lines", thumbViewBox: "40 150 108 108" },
];
