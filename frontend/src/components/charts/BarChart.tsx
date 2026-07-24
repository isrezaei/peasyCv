"use client";

import { Box } from "@chakra-ui/react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";

/**
 * The single charting primitive shared by /admin and /dashboard. It centralizes
 * everything those bar charts have in common, so individual charts pass only
 * their data + a couple of layout overrides:
 *   - tree-shakeable Chart.js registration (only what bar charts use — never
 *     `registerables`);
 *   - runtime resolution of the app's neutral gray tokens (canvas can't read CSS
 *     vars), re-resolved when next-themes toggles `.dark`;
 *   - RTL config (Persian): value axis on the right, categories reversed,
 *     right-to-left legend + tooltip;
 *   - base options styled to the app tokens (Kalameh font, subtle grid,
 *     rounded tooltip).
 *
 * Series are colored by dataset index from the gray ramp below — no brand
 * palette, no teal/gold/coral/sky. Two mode-aware steps that stay distinct in
 * both light and dark: a medium gray (`accent.solid`) and a strong near-fg gray.
 */

// Register ONCE, only the controllers/elements/scales/plugins bar charts need.
ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Series colors by dataset index (cycled). Both are mode-aware app tokens and
// stay clearly distinguishable in light and dark.
const SERIES_VARS = ["--chakra-colors-accent-solid", "--chakra-colors-fg"];

interface ResolvedTokens {
  series: string[];
  grid: string;
  tick: string;
  fg: string;
  tooltipBg: string;
  tooltipBorder: string;
  font: string;
}

/**
 * Resolve a token to a concrete color string usable by canvas. Reading the CSS
 * var directly is not enough — semantic tokens hold a `var(...)` REFERENCE, not a
 * color. So paint it onto a throwaway probe and read back the browser-resolved
 * value (which also follows the active light/dark mode).
 */
function resolveColor(scope: HTMLElement, cssVar: string): string {
  const probe = document.createElement("span");
  probe.style.cssText = `color:var(${cssVar});position:absolute;pointer-events:none`;
  scope.appendChild(probe);
  const value = getComputedStyle(probe).color;
  scope.removeChild(probe);
  return value;
}

function resolveTokens(scope: HTMLElement): ResolvedTokens {
  return {
    series: SERIES_VARS.map((cssVar) => resolveColor(scope, cssVar)),
    grid: resolveColor(scope, "--chakra-colors-border"),
    tick: resolveColor(scope, "--chakra-colors-fg-muted"),
    fg: resolveColor(scope, "--chakra-colors-fg"),
    tooltipBg: resolveColor(scope, "--chakra-colors-bg-panel"),
    tooltipBorder: resolveColor(scope, "--chakra-colors-border"),
    font: getComputedStyle(scope).fontFamily,
  };
}

/**
 * Read tokens from the chart element on mount and again whenever the document's
 * class list changes (next-themes flips `.dark` there), so charts recolor with
 * the rest of the panel. Returns the ref to attach and the resolved tokens.
 */
function useChartTokens() {
  const ref = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState<ResolvedTokens | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setTokens(resolveTokens(el));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return { ref, tokens };
}

export interface BarDataset {
  label?: string;
  data: number[];
}

export interface BarChartProps {
  labels: string[];
  datasets: BarDataset[];
  /** Horizontal bars (category on the y-axis) — for ranked lists. */
  horizontal?: boolean;
  /** Show the legend (multi-series charts); single-series name their card. */
  showLegend?: boolean;
  /** Format a raw value for tooltips/axis (e.g. Persian digits). */
  formatValue?: (value: number) => string;
  height?: string | number;
}

/**
 * A gray-themed Chart.js bar chart. Vertical by default; `horizontal` flips it
 * for ranked lists. Colors, grid, font and RTL are all handled here.
 */
export function BarChart({
  labels,
  datasets,
  horizontal = false,
  showLegend = false,
  formatValue = (v) => String(v),
  height = 220,
}: BarChartProps) {
  const { ref, tokens } = useChartTokens();

  const data = useMemo<ChartData<"bar">>(() => {
    if (!tokens) return { labels, datasets: [] };
    return {
      labels,
      datasets: datasets.map((ds, i) => {
        const color = tokens.series[i % tokens.series.length];
        return {
          label: ds.label,
          data: ds.data,
          backgroundColor: color,
          hoverBackgroundColor: color,
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: horizontal ? 18 : 26,
          categoryPercentage: 0.7,
          barPercentage: 0.9,
        };
      }),
    };
  }, [labels, datasets, tokens, horizontal]);

  const options = useMemo<ChartOptions<"bar">>(() => {
    const grid = tokens?.grid ?? "rgba(0,0,0,0.06)";
    const tick = tokens?.tick ?? "rgba(0,0,0,0.5)";
    const font = tokens?.font ?? "sans-serif";
    const categoryAxis = { grid: { display: false }, ticks: { color: tick, font: { family: font } } };
    const valueAxis = {
      // Value axis on the right for RTL; subtle grid, no border.
      position: (horizontal ? "top" : "right") as "top" | "right",
      beginAtZero: true,
      grid: { color: grid, drawTicks: false },
      border: { display: false },
      ticks: {
        color: tick,
        font: { family: font },
        precision: 0,
        callback: (v: string | number) => formatValue(Number(v)),
      },
    };
    return {
      indexAxis: horizontal ? "y" : "x",
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 4 },
      scales: horizontal
        ? { y: { ...categoryAxis, reverse: false }, x: { ...valueAxis, reverse: true } }
        : { x: { ...categoryAxis, reverse: true }, y: valueAxis },
      plugins: {
        legend: {
          display: showLegend,
          position: "top",
          align: "end",
          rtl: true,
          textDirection: "rtl",
          labels: { color: tick, usePointStyle: true, boxWidth: 8, boxHeight: 8, font: { family: font } },
        },
        tooltip: {
          rtl: true,
          textDirection: "rtl",
          backgroundColor: tokens?.tooltipBg ?? "#fff",
          titleColor: tokens?.fg ?? "#000",
          bodyColor: tokens?.fg ?? "#000",
          borderColor: tokens?.tooltipBorder ?? grid,
          borderWidth: 1,
          cornerRadius: 12,
          padding: 10,
          displayColors: datasets.length > 1,
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataset.label ? `${ctx.dataset.label}: ` : "";
              return `${label}${formatValue(Number(ctx.parsed[horizontal ? "x" : "y"] ?? 0))}`;
            },
          },
        },
      },
    };
  }, [tokens, horizontal, showLegend, formatValue, datasets.length]);

  return (
    <Box ref={ref} position="relative" width="100%" height={height}>
      {/* Bars only paint once tokens resolve (first layout effect), so colors are
          never a flash of un-themed defaults. */}
      {tokens ? <Bar data={data} options={options} /> : null}
    </Box>
  );
}
