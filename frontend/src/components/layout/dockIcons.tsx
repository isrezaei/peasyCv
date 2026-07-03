/**
 * Topbar dock glyphs — ported 1:1 from the imported "Topbar Dock" design so the
 * icon-only dock matches it exactly (shapes, 22px tool size, round caps). They
 * paint with `currentColor`, so the button drives active/idle colour from the
 * app's zinc chrome tokens. Kept separate from the app-wide Tabler set in
 * `ui/icons.tsx`; these are dock-specific.
 */
import type { ReactNode, SVGProps } from "react";

type IconProps = { size?: number; strokeWidth?: number } & Omit<
  SVGProps<SVGSVGElement>,
  "width" | "height"
>;

function DockSvg({
  size = 22,
  strokeWidth = 1.75,
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---- Tool glyphs (centre dock, 22px / stroke 1.75) ---- */

export function DesignGlyph(props: IconProps) {
  return (
    <DockSvg {...props}>
      <path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.4-.16-.76-.41-1.02-.24-.25-.39-.6-.39-.98 0-.83.67-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8z" />
      <circle cx="7.7" cy="11.5" r="1" />
      <circle cx="10.2" cy="7.6" r="1" />
      <circle cx="14.6" cy="7.6" r="1" />
      <circle cx="17" cy="11.5" r="1" />
    </DockSvg>
  );
}

export function TemplatesGlyph(props: IconProps) {
  return (
    <DockSvg {...props}>
      <rect x="3" y="3" width="18" height="7" rx="1.6" />
      <rect x="3" y="14" width="9" height="7" rx="1.6" />
      <rect x="16" y="14" width="5" height="7" rx="1.6" />
    </DockSvg>
  );
}

export function SectionsGlyph(props: IconProps) {
  return (
    <DockSvg {...props}>
      <path d="M7 4v15" />
      <path d="m3.5 7.5 3.5-3.5 3.5 3.5" />
      <path d="M17 20V5" />
      <path d="m13.5 16.5 3.5 3.5 3.5-3.5" />
    </DockSvg>
  );
}

export function ReviewGlyph(props: IconProps) {
  return (
    <DockSvg {...props}>
      <rect x="8" y="2.5" width="8" height="4" rx="1.2" />
      <path d="M16 4.5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h2" />
      <path d="m9 13.5 2 2 4-4" />
    </DockSvg>
  );
}

export function TextGlyph(props: IconProps) {
  return (
    <DockSvg {...props}>
      <path d="M11.5 20H21" />
      <path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </DockSvg>
  );
}

export function AssistantGlyph(props: IconProps) {
  return (
    <DockSvg {...props}>
      <path d="M11.5 3l1.6 4.4L17.5 9l-4.4 1.6L11.5 15l-1.6-4.4L5.5 9l4.4-1.6z" />
      <path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </DockSvg>
  );
}

/* ---- Panel toggle (RTL start). Caller flips via `style` transform. ---- */

export function PanelToggleGlyph(props: IconProps) {
  return (
    <DockSvg size={21} strokeWidth={1.8} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M15 4v16" />
      <path d="M7 9l2.4 3L7 15" />
    </DockSvg>
  );
}

/* ---- Save status (end cluster). `track` is the faint ring colour. ---- */

export function SaveCheckGlyph({ track, ...props }: IconProps & { track: string }) {
  return (
    <DockSvg size={21} strokeWidth={2.1} {...props}>
      <circle cx="12" cy="12" r="9" stroke={track} />
      <path d="m8.3 12.2 2.4 2.4 4.8-4.8" />
    </DockSvg>
  );
}

export function SaveSpinnerGlyph({ track, ...props }: IconProps & { track: string }) {
  return (
    <DockSvg size={21} strokeWidth={2} className="dock-spin" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke={track} />
      <path d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5" />
    </DockSvg>
  );
}

/* ---- Avatar glyph (end cluster). ---- */

export function AvatarGlyph(props: IconProps) {
  return (
    <DockSvg size={20} strokeWidth={1.8} {...props}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 20c0-3.6 3.2-5.6 7-5.6s7 2 7 5.6" />
    </DockSvg>
  );
}
