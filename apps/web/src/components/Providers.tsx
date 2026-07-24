"use client";

import { I18nProvider } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * HeroUI v3 needs no theme <Provider>, but its React-Aria foundation reads text
 * direction from the active locale. Pinning `fa-IR` makes every HeroUI overlay,
 * menu and field mirror to RTL deterministically on the server (no LTR-first
 * hydration flash). This is the site's only root-level client boundary; the
 * page content passed as `children` stays server-rendered/static.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <I18nProvider locale="fa-IR">{children}</I18nProvider>;
}
