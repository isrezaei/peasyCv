import { BackgroundLayer } from "@/components/resume/backgrounds/BackgroundLayer";
import type { ResolvedTheme } from "@/lib/themes";
import type { ThemeSettings } from "@/types";

interface ResumeBackgroundProps {
  theme: ThemeSettings;
  colors: ResolvedTheme;
  idSuffix: string;
}

export function ResumeBackground({ theme, colors, idSuffix }: ResumeBackgroundProps) {
  if (theme.backgroundPattern === "none") return null;
  return (
    <BackgroundLayer
      pattern={theme.backgroundPattern}
      accent={colors.accent}
      base={colors.base}
      soft={colors.soft}
      idSuffix={idSuffix}
    />
  );
}
