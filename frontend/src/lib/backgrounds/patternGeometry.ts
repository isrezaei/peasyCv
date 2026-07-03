/**
 * Geometry for the résumé background pattern family, ported 1:1 from the
 * Claude Design "Resume Pattern Family" handoff (Board.dc.html · renderVals).
 * Every value is computed once at module load in the A4 user space (210 × 297)
 * at the design's baseline opacities. Colour is applied by the renderer via
 * `currentColor`, so a single theme hue retints the whole set, and the renderer
 * scales the overall strength with one group opacity (the «شدت پس‌زمینه» control).
 */

/** 1-decimal coordinate formatter, matching the design's path precision. */
const f = (n: number): string => n.toFixed(1);
/** Keeps computed opacities/radii tidy in the DOM (design uses toFixed(3)). */
const round3 = (n: number): number => Math.round(n * 1000) / 1000;

// ---- 01 · BOTANICALS -----------------------------------------------------
export interface Blob {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}
export interface Leaf {
  outline: string;
  mid: string;
}
export interface Dot {
  x: number;
  y: number;
  r: number;
}

function buildBotanical() {
  const blobs: Blob[] = [
    { cx: 206, cy: 4, rx: 44, ry: 36 },
    { cx: -10, cy: 152, rx: 30, ry: 72 },
  ];
  const sdots: Dot[] = [
    { x: 40, y: 206, r: 5 },
    { x: 188, y: 256, r: 4 },
    { x: 201, y: 272, r: 3 },
  ];
  const leaves: Leaf[] = [];
  const stems: string[] = [];

  const leaf = (cx: number, cy: number, len: number, ang: number) => {
    const w = len * 0.34;
    const a = (ang * Math.PI) / 180;
    const ux = Math.cos(a), uy = Math.sin(a), vx = -Math.sin(a), vy = Math.cos(a);
    const tx = cx + ux * len, ty = cy + uy * len;
    const c1x = cx + ux * len * 0.5 + vx * w, c1y = cy + uy * len * 0.5 + vy * w;
    const c2x = cx + ux * len * 0.5 - vx * w, c2y = cy + uy * len * 0.5 - vy * w;
    leaves.push({
      outline: `M ${f(cx)} ${f(cy)} Q ${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)} Q ${f(c2x)} ${f(c2y)} ${f(cx)} ${f(cy)} Z`,
      mid: `M ${f(cx)} ${f(cy)} L ${f(tx)} ${f(ty)}`,
    });
  };
  const branch = (sx: number, sy: number, ex: number, ey: number, n: number, len: number, bow: number) => {
    const mx = (sx + ex) / 2 + bow, my = (sy + ey) / 2;
    stems.push(`M ${f(sx)} ${f(sy)} Q ${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`);
    const baseAng = (Math.atan2(ey - sy, ex - sx) * 180) / Math.PI;
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1);
      const px = sx + (ex - sx) * t, py = sy + (ey - sy) * t;
      const side = i % 2 ? 1 : -1;
      leaf(px, py, len * (0.82 + 0.18 * Math.sin(i)), baseAng + side * 40);
    }
    leaf(ex, ey, len * 0.9, baseAng);
  };

  branch(150, 22, 206, 62, 4, 20, 6);
  branch(8, 118, -2, 206, 4, 20, -8);
  branch(150, 292, 206, 250, 3, 17, 8);

  return { blobs, stems, leaves, sdots };
}
export const BOTANICAL = buildBotanical();
// The foliage (stems + leaves) is deliberately LIGHTER than the solid geometric
// elements (blobs + dots), while every part stays the same single hue — so the
// botanical motif reads as one cohesive colour with the leaves as a softer tint.
export const BOTANICAL_OPACITY = { blob: 0.22, stem: 0.16, leaf: 0.14, dot: 0.46 };

// ---- 03 · BRACKETS + RINGS ----------------------------------------------
export interface Mark {
  x: number;
  y: number;
  rot: number;
}
export interface Ring {
  x: number;
  y: number;
  r: number;
}
export const BRACKET_PATH = "M 0 15 L 0 0 L 15 0";
export const BRACKETS_OPACITY = 0.22;
export const BRACKETS_MARKS: Mark[] = [
  { x: 64, y: 56, rot: 0 }, { x: 152, y: 40, rot: 90 }, { x: 120, y: 96, rot: 180 },
  { x: 178, y: 122, rot: 0 }, { x: 42, y: 252, rot: 270 }, { x: 100, y: 256, rot: 90 },
];
export const BRACKETS_RINGS: Ring[] = [
  { x: 188, y: 30, r: 11 }, { x: 106, y: 70, r: 9 }, { x: 18, y: 272, r: 10 }, { x: 166, y: 162, r: 7 },
];

// ---- 04 · TINY CHEVRON FIELD --------------------------------------------
export interface OpacityPath {
  d: string;
  o: number;
}

function buildChevronField(): OpacityPath[] {
  const chev: OpacityPath[] = [];
  const fx = 122, fy = 64;
  for (let r = 0; r < 14; r++) {
    for (let c = 0; c < 11; c++) {
      const x = 18 + c * 19, y = 16 + r * 27;
      const dist = Math.hypot(x - fx, y - fy);
      const o = 0.26 - dist / 270;
      if (o < 0.025) continue;
      const t = (r * 7 + c * 3) % 5;
      let d: string;
      if (t === 0) d = `M ${f(x - 6)} ${f(y + 4)} L ${f(x)} ${f(y - 3)} L ${f(x + 6)} ${f(y + 4)}`;
      else if (t === 1) d = `M ${f(x - 6)} ${f(y - 4)} L ${f(x)} ${f(y + 3)} L ${f(x + 6)} ${f(y - 4)}`;
      else if (t === 2) d = `M ${f(x - 5)} ${f(y + 5)} L ${f(x + 5)} ${f(y - 5)}`;
      else if (t === 3) d = `M ${f(x - 5)} ${f(y - 5)} L ${f(x + 5)} ${f(y + 5)}`;
      else d = `M ${f(x - 5)} ${f(y - 5)} L ${f(x + 5)} ${f(y + 5)} M ${f(x - 5)} ${f(y + 5)} L ${f(x + 5)} ${f(y - 5)}`;
      chev.push({ d, o: round3(o) });
    }
  }
  return chev;
}
export const CHEVRON_FIELD = buildChevronField();

// ---- 06 · CONCENTRIC ARCS -----------------------------------------------
function buildArcs(): OpacityPath[] {
  const arcs: OpacityPath[] = [];
  for (let r = 26; r <= 215; r += 15) {
    arcs.push({ d: `M 0 ${f(297 - r)} A ${r} ${r} 0 0 1 ${r} 297`, o: round3(0.16 - r * 0.0004) });
  }
  return arcs;
}
export const CONCENTRIC_ARCS = buildArcs();

// ---- 07 · DOT-GRID FADE -------------------------------------------------
export interface FadeDot {
  x: number;
  y: number;
  r: number;
  o: number;
}
function buildDotGrid(): FadeDot[] {
  const dots: FadeDot[] = [];
  for (let r = 0; r < 23; r++) {
    for (let c = 0; c < 17; c++) {
      const x = 8 + c * 13, y = 8 + r * 13;
      const dist = Math.hypot(x, y);
      const k = Math.max(0, 1 - dist / 205);
      if (k <= 0.02) continue;
      dots.push({ x, y, r: round3(0.5 + 1.6 * k), o: round3(0.08 + 0.24 * k) });
    }
  }
  return dots;
}
export const DOT_GRID = buildDotGrid();

// ---- 08 · TOPOGRAPHIC ---------------------------------------------------
function buildTopo(): OpacityPath[] {
  const topo: OpacityPath[] = [];
  const bases = [148, 176, 200, 220, 236, 249, 259, 266];
  bases.forEach((yb, i) => {
    const amp = 11 - i * 0.7;
    const d = `M -6 ${f(yb)} C 40 ${f(yb - amp)} 70 ${f(yb + amp)} 105 ${f(yb - amp * 0.5)} S 176 ${f(yb + amp)} 216 ${f(yb - amp * 0.4)}`;
    topo.push({ d, o: round3(0.06 + i * 0.012) });
  });
  return topo;
}
export const TOPO_LINES = buildTopo();
