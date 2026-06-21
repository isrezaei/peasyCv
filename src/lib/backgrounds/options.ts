import { t } from "@/lib/i18n";
import type { BackgroundPatternId } from "@/types";

export interface BackgroundOption {
  id: BackgroundPatternId;
  label: string;
}

export const backgroundOptions: BackgroundOption[] = [
  { id: "none", label: t.backgrounds.none },
  { id: "blobs", label: t.backgrounds.blobs },
  { id: "hexLines", label: t.backgrounds.hexLines },
  { id: "topographic", label: t.backgrounds.topographic },
  { id: "halftone", label: t.backgrounds.halftone },
  { id: "chevron", label: t.backgrounds.chevron },
  { id: "corner-brackets", label: t.backgrounds["corner-brackets"] },
  { id: "rainbow-corner", label: t.backgrounds["rainbow-corner"] },
];
