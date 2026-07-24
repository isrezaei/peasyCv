import type { IconKey } from "@/lib/content/features";

/**
 * Inline stroke icons (no icon-font / no react-icons dependency — keeps client
 * JS at zero for decorative marks). 24×24, inherit currentColor. Directional
 * icons (arrow/chevron) live in DirectionalIcon and mirror under RTL.
 */
const paths: Record<IconKey, React.ReactNode> = {
  rtl: <path d="M15 4H9a4 4 0 0 0 0 8h1M13 4v16M17 4v16M7 16l-3 3 3 3" />,
  template: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </>
  ),
  preview: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  pdf: (
    <>
      <path d="M14 3v5h5" />
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M8 13h1.5a1.5 1.5 0 0 1 0 3H8v-3ZM8 16v2" />
    </>
  ),
  ats: (
    <>
      <path d="M4 6h10M4 12h16M4 18h12" />
      <path d="M17 5l2 2 3-3" />
    </>
  ),
  palette: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="8.5" cy="10.5" r="1" />
      <circle cx="12" cy="8" r="1" />
      <circle cx="15.5" cy="10.5" r="1" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6Z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  bilingual: (
    <>
      <path d="M4 5h7M7 4v1c0 3-1.5 5-4 6M5 8c0 2 2 3.5 5 4" />
      <path d="M13 20l4-9 4 9M14.5 17h5" />
    </>
  ),
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
};

export function Icon({
  name,
  className = "",
  size = 24,
}: {
  name: IconKey;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
