import { Box } from "@chakra-ui/react";
import type { CSSProperties, ReactNode } from "react";
import { A4_HEIGHT_MM, A4_WIDTH_MM, PAGE_MARGIN_MM } from "@/lib/pagination";

/** Base body font size in px at scale 1.0; em-based resume typography multiplies this. */
const BASE_FONT_PX = 15;

interface A4PageProps {
  pageIndex: number;
  backgroundColor: string;
  /** Fixed A4 height for paginated templates; auto-growing sheet for column templates. */
  autoHeight?: boolean;
  /**
   * HORIZONTAL (left/right) inner padding in mm. The vertical (top/bottom) margin
   * is NOT configurable — the frame always applies the fixed {@link PAGE_MARGIN_MM}
   * top and bottom so every page keeps equal 16mm margins regardless of template.
   */
  paddingMm?: number;
  fontStack: string;
  fontScale: number;
  lineHeight: number;
  decorations?: ReactNode;
  /** When true the page frame supplies no padding so children control full-bleed columns. */
  bleed?: boolean;
  /**
   * Extra inline style for the content wrapper — the templates pass the resume's
   * text-tier CSS variables (`--rz-secondary`, `--rz-body`) here so every nested
   * field can paint the right family tint without prop-drilling the colours.
   */
  contentVars?: CSSProperties;
  children: ReactNode;
}

export function A4Page({
  pageIndex,
  backgroundColor,
  autoHeight = false,
  paddingMm = PAGE_MARGIN_MM,
  fontStack,
  fontScale,
  lineHeight,
  decorations,
  bleed = false,
  contentVars,
  children,
}: A4PageProps) {
  return (
    <Box
      data-page-index={pageIndex}
      // `light` is Chakra's color-mode scope class: it re-pins EVERY semantic
      // token (fg.*, bg.*, border, shadows…) to its light value for this whole
      // subtree, so the app's dark mode can never bleed into the page. The
      // explicit `color` stops the dark body colour from being inherited by
      // any unstyled text (same #18181b the body sets in light mode), and
      // `colorScheme` keeps native inputs/carets rendering light.
      className="a4-page light"
      position="relative"
      width={`${A4_WIDTH_MM}mm`}
      height={autoHeight ? "auto" : `${A4_HEIGHT_MM}mm`}
      minHeight={`${A4_HEIGHT_MM}mm`}
      bg={backgroundColor}
      overflow="hidden"
      style={{
        fontFamily: fontStack,
        fontSize: `${BASE_FONT_PX * fontScale}px`,
        lineHeight,
        color: "#18181b",
        colorScheme: "light",
      }}
    >
      {decorations ? (
        <Box
          data-rz-decorations
          position="absolute"
          inset="0"
          zIndex={0}
          pointerEvents="none"
        >
          {decorations}
        </Box>
      ) : null}
      <Box
        position="relative"
        zIndex={1}
        height={autoHeight ? "auto" : "100%"}
        minHeight={`${A4_HEIGHT_MM}mm`}
        // Vertical margin is frame-owned and fixed at 16mm; only the horizontal
        // inset follows the prop. `bleed` lets column templates paint edge-to-edge
        // and supply the same fixed 16mm vertical margin inside each column.
        paddingBlock={bleed ? "0" : `${PAGE_MARGIN_MM}mm`}
        paddingInline={bleed ? "0" : `${paddingMm}mm`}
        style={contentVars}
      >
        {children}
      </Box>
    </Box>
  );
}
