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

// ============================================================================
// COLUMN PATTERNS (timeline-panel side column)
// ----------------------------------------------------------------------------
// The panel of the "timeline-panel" template is a TALL, NARROW strip. Rather
// than slice a corner-anchored A4 motif into it, each variant below is a true
// repeating GEOMETRIC pattern authored across the whole COLUMN_VIEW space, so it
// tiles edge-to-edge and covers the entire column at any height — modern
// geometric textures (chevron, hexagon-and-dash, nested hexagons, isometric
// cubes, a trisected-triangle grid and a tri-star field) reworked from the
// reference pattern sheets. Same single-hue `currentColor` policy and pure-SVG (no
// defs/filters) print fidelity as the page artwork above; each pattern is a flat
// array of path strings the renderer strokes at one uniform opacity.
// ============================================================================

/** Narrow, tall user space every column variant is authored in (≈ the panel's
 *  ~1:5 aspect); rendered with `xMidYMid slice` so it fills the panel box. */
export const COLUMN_VIEW = { w: 64, h: 320 };

/** Tiny deterministic PRNG (LCG) so the scattered variants are stable across
 *  renders and identical in the browser and the headless PDF. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/** Six corners of a flat-top hexagon (a horizontal edge at top and bottom, a
 *  point at left and right) centred on (cx, cy) with circumradius R. Flat-top
 *  hexagons tile into a honeycomb with columns spaced 1.5·R apart and every
 *  other column nudged down by half a row — the geometry all the hex-based
 *  column patterns below share. */
function hexCorners(cx: number, cy: number, R: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 180) * (60 * i);
    pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
  }
  return pts;
}
/** Closed SVG path for a flat-top hexagon. */
function hexPath(cx: number, cy: number, R: number): string {
  const p = hexCorners(cx, cy, R);
  return `M ${p.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L ")} Z`;
}
/** Column/row step of a flat-top honeycomb of circumradius R. */
function hexGridSteps(R: number) {
  return { colStep: 1.5 * R, rowStep: Math.sqrt(3) * R };
}

/** "x y" for one point. */
const pt = (p: readonly [number, number]): string => `${f(p[0])} ${f(p[1])}`;
/** Polyline / polygon path through the given points (closed with Z when asked). */
function polyPath(pts: readonly [number, number][], close = false): string {
  return `M ${pts.map(pt).join(" L ")}${close ? " Z" : ""}`;
}

// ---- COLUMN · HEX-DASH ---------------------------------------------------
// Alternating vertical columns: small flat-top hexagons hugged by a chevron
// caret above and below, next to columns of paired short vertical dashes —
// staggered column to column (the "hexagon + dash" mosaic).
function buildColumnHexDash(): string[] {
  const out: string[] = [];
  const colStep = 11; // horizontal pitch (hex column ↔ dash column)
  const rowStep = 15; // vertical pitch inside a column
  const rHex = 5.2; // hexagon circumradius (small)
  let ci = 0;
  for (let cx = 5; cx <= COLUMN_VIEW.w - 1; cx += colStep) {
    const yOff = (ci % 2) * (rowStep / 2); // stagger alternate columns
    if (ci % 2 === 0) {
      // Hexagon column, one chevron caret centred in each gap between hexagons.
      const cvW = rHex * 0.8;
      const cvH = 2.2;
      for (let cy = -rowStep + yOff; cy <= COLUMN_VIEW.h + rowStep; cy += rowStep) {
        out.push(hexPath(cx, cy, rHex));
        const gy = cy + rowStep / 2;
        out.push(`M ${f(cx - cvW)} ${f(gy + cvH)} L ${f(cx)} ${f(gy - cvH)} L ${f(cx + cvW)} ${f(gy + cvH)}`);
      }
    } else {
      // Dash column: a pair of short vertical bars per row.
      const barH = 4.4;
      const sep = 2.6;
      for (let cy = -rowStep + yOff; cy <= COLUMN_VIEW.h + rowStep; cy += rowStep) {
        out.push(`M ${f(cx - sep)} ${f(cy - barH)} L ${f(cx - sep)} ${f(cy + barH)}`);
        out.push(`M ${f(cx + sep)} ${f(cy - barH)} L ${f(cx + sep)} ${f(cy + barH)}`);
      }
    }
    ci += 1;
  }
  return out;
}
export const COLUMN_HEXDASH = buildColumnHexDash();

// ---- COLUMN · CUBES ------------------------------------------------------
// Nested isometric cubes (tumbling blocks): each cube is a pointy-top hexagon
// split by a Y into three rhombus faces, and every face carries a smaller
// concentric rhombus — the doubled-outline "3D box" motif. Cubes are drawn a
// touch inside their cell so a thin channel separates neighbours, as in the
// reference.
function buildColumnCubes(): string[] {
  const out: string[] = [];
  const R = 8; // cell circumradius (medium-small cube)
  const draw = R * 0.9; // inset radius → channel between cubes
  const faceInset = 0.5; // inner rhombus scale about each face centroid
  const A = Math.sqrt(3) / 2;
  const colStep = Math.sqrt(3) * R; // pointy-top horizontal pitch
  const rowStep = 1.5 * R; // pointy-top vertical pitch
  let row = 0;
  for (let cy = -R; cy <= COLUMN_VIEW.h + R; cy += rowStep) {
    const xOff = (row % 2) * (colStep / 2);
    for (let cx = -colStep + xOff; cx <= COLUMN_VIEW.w + colStep; cx += colStep) {
      const O: [number, number] = [cx, cy];
      const top: [number, number] = [cx, cy - draw];
      const ur: [number, number] = [cx + A * draw, cy - draw / 2];
      const lr: [number, number] = [cx + A * draw, cy + draw / 2];
      const bot: [number, number] = [cx, cy + draw];
      const ll: [number, number] = [cx - A * draw, cy + draw / 2];
      const ul: [number, number] = [cx - A * draw, cy - draw / 2];
      // Cube silhouette + the three near-corner spokes (the Y).
      out.push(polyPath([top, ur, lr, bot, ll, ul], true));
      out.push(`M ${pt(O)} L ${pt(top)} M ${pt(O)} L ${pt(lr)} M ${pt(O)} L ${pt(ll)}`);
      // Each of the three faces gets a smaller concentric rhombus.
      const faceList: [number, number][][] = [
        [O, ul, top, ur], // top face
        [O, ur, lr, bot], // right face
        [O, bot, ll, ul], // left face
      ];
      for (const q of faceList) {
        const gx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4;
        const gy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
        const inner = q.map(([x, y]) => [gx + (x - gx) * faceInset, gy + (y - gy) * faceInset] as [number, number]);
        out.push(polyPath(inner, true));
      }
    }
    row += 1;
  }
  return out;
}
export const COLUMN_CUBES = buildColumnCubes();

// ---- COLUMN · CHEVRON ----------------------------------------------------
// Continuous sharp zigzag stripes stacked down the full column height, each
// spanning the whole width (and overshooting both edges so the slice never
// clips a gap).
function buildColumnChevron(): string[] {
  const out: string[] = [];
  const half = 7; // half wavelength (one up- or down-stroke)
  const amp = 4; // peak height above/below the stripe baseline
  const stepY = 8; // vertical gap between stripes
  for (let y = -amp; y <= COLUMN_VIEW.h + amp; y += stepY) {
    let d = `M -8 ${f(y + amp)}`;
    let up = true;
    for (let x = -8 + half; x <= COLUMN_VIEW.w + 8; x += half) {
      d += ` L ${f(x)} ${f(up ? y - amp : y + amp)}`;
      up = !up;
    }
    out.push(d);
  }
  return out;
}
export const COLUMN_CHEVRON = buildColumnChevron();

// ---- COLUMN · HEX RINGS --------------------------------------------------
// A honeycomb where every cell is a set of concentric hexagon outlines around a
// small solid centre — the "nested hexagon" target motif.
function buildColumnHexRings(): { rings: string[]; dots: Dot[] } {
  const rings: string[] = [];
  const dots: Dot[] = [];
  const R = 10;
  const { colStep, rowStep } = hexGridSteps(R);
  const scales = [1, 0.62, 0.3];
  let col = 0;
  for (let cx = -R; cx <= COLUMN_VIEW.w + R; cx += colStep) {
    const yOff = (col % 2) * (rowStep / 2);
    for (let cy = -R + yOff; cy <= COLUMN_VIEW.h + R; cy += rowStep) {
      for (const s of scales) rings.push(hexPath(cx, cy, R * s));
      dots.push({ x: round3(cx), y: round3(cy), r: 0.9 });
    }
    col += 1;
  }
  return { rings, dots };
}
const COLUMN_HR = buildColumnHexRings();
export const COLUMN_HEX_RINGS = COLUMN_HR.rings;
export const COLUMN_HEX_RING_DOTS = COLUMN_HR.dots;

// ---- COLUMN · TRIANGLES --------------------------------------------------
// A triangular grid in which every triangle holds a smaller concentric triangle
// trisected from its centroid to the three inner-edge midpoints — three-cell
// "trisected triangles" tiling the whole column.
function buildColumnTriangles(): string[] {
  const out: string[] = [];
  const L = 13; // triangle side
  const h = (L * Math.sqrt(3)) / 2; // row height
  const inset = 0.62; // inner triangle scale about the centroid
  const seen = new Set<string>();
  // Sheared triangular lattice point (row j shifted right by j·L/2).
  const P = (i: number, j: number): [number, number] => [i * L + j * (L / 2), j * h];
  const addEdge = (a: [number, number], b: [number, number]) => {
    let p = a;
    let q = b;
    if (p[0] > q[0] + 1e-6 || (Math.abs(p[0] - q[0]) < 1e-6 && p[1] > q[1])) {
      const t = p;
      p = q;
      q = t;
    }
    const key = `${Math.round(p[0] * 2)},${Math.round(p[1] * 2)},${Math.round(q[0] * 2)},${Math.round(q[1] * 2)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(`M ${pt(p)} L ${pt(q)}`);
  };
  const decorate = (tri: [number, number][]) => {
    const gx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
    const gy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
    const inner = tri.map(([x, y]) => [gx + (x - gx) * inset, gy + (y - gy) * inset] as [number, number]);
    out.push(polyPath(inner, true));
    for (let i = 0; i < 3; i += 1) {
      const mx = (inner[i][0] + inner[(i + 1) % 3][0]) / 2;
      const my = (inner[i][1] + inner[(i + 1) % 3][1]) / 2;
      out.push(`M ${f(gx)} ${f(gy)} L ${f(mx)} ${f(my)}`);
    }
  };
  const jMax = Math.ceil(COLUMN_VIEW.h / h) + 1;
  for (let j = -1; j <= jMax; j += 1) {
    // Column range that keeps this row's points inside the strip.
    const iStart = Math.floor((-L - (j * L) / 2) / L) - 1;
    const iEnd = Math.ceil((COLUMN_VIEW.w + L - (j * L) / 2) / L) + 1;
    for (let i = iStart; i <= iEnd; i += 1) {
      const down: [number, number][] = [P(i, j), P(i + 1, j), P(i, j + 1)];
      const up: [number, number][] = [P(i + 1, j), P(i, j + 1), P(i + 1, j + 1)];
      for (const tri of [down, up]) {
        addEdge(tri[0], tri[1]);
        addEdge(tri[1], tri[2]);
        addEdge(tri[2], tri[0]);
        decorate(tri);
      }
    }
  }
  return out;
}
export const COLUMN_TRIANGLES = buildColumnTriangles();

// ---- COLUMN · TRI-STAR ---------------------------------------------------
// A field of three-pronged "Y" marks (one stem down, two arms up at 120°),
// half-offset row to row so they pack evenly across the whole column.
function buildColumnTristar(): string[] {
  const out: string[] = [];
  const stepX = 10;
  const stepY = 11;
  const L = 3.8; // arm length
  const dirs: [number, number][] = [
    [0, 1], // stem, straight down
    [-0.866, -0.5], // up-left
    [0.866, -0.5], // up-right
  ];
  let row = 0;
  for (let y = 2; y <= COLUMN_VIEW.h + stepY; y += stepY) {
    const xOff = (row % 2) * (stepX / 2);
    for (let x = -2 + xOff; x <= COLUMN_VIEW.w + 2; x += stepX) {
      let d = "";
      for (const [dx, dy] of dirs) {
        d += `M ${f(x)} ${f(y)} L ${f(x + dx * L)} ${f(y + dy * L)} `;
      }
      out.push(d.trim());
    }
    row += 1;
  }
  return out;
}
export const COLUMN_TRISTAR = buildColumnTristar();

// ---- COLUMN · SOFT BLOBS -------------------------------------------------
export interface ColumnBlob {
  cx: number;
  cy: number;
  r: number;
  /** Which theme tone fills it: the mid-tone, the soft tint or a lighter mix. */
  tone: "base" | "soft" | "light";
  o: number;
}
function buildColumnBlobs(): ColumnBlob[] {
  const rand = rng(11);
  const tones: ColumnBlob["tone"][] = ["base", "soft", "light"];
  const out: ColumnBlob[] = [];
  const N = 13;
  for (let i = 0; i < N; i += 1) {
    out.push({
      cx: round3(8 + rand() * 48),
      cy: round3(10 + (i / N) * (COLUMN_VIEW.h - 12) + (rand() - 0.5) * 16),
      r: round3(5 + rand() * 10),
      tone: tones[i % 3],
      o: round3(0.3 + rand() * 0.25),
    });
  }
  return out;
}
export const COLUMN_BLOBS = buildColumnBlobs();
