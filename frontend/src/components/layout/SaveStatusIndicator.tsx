"use client";

import { Box } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSaveStatus } from "@/hooks/store/useSaveStatus";
import { DOCK, DOCK_RADII } from "@/lib/design/tokens";
import { t } from "@/lib/i18n";
import { SaveCheckGlyph, SaveSpinnerGlyph } from "./dockIcons";

/**
 * Icon-only save status for the dock's end cluster (imported "Topbar Dock"):
 * a spinning ring while the debounced field/persist lifecycle is in flight, a
 * green check once everything is settled (idle/saved). The Persian state text is
 * shown on hover. Same `useSaveStatus` contract as before — presentation only.
 */
export function SaveStatusIndicator() {
  const { saveStatus } = useSaveStatus();
  const isSaving = saveStatus === "saving";
  const label = isSaving ? t.toolbar.saving : t.toolbar.autosaved;

  return (
    <Tooltip label={label}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="38px"
        height="38px"
        color={isSaving ? DOCK.spinner : DOCK.saveGreen}
        aria-label={label}
        style={{ borderRadius: DOCK_RADII.saveBtn }}
      >
        {isSaving ? (
          <SaveSpinnerGlyph track={DOCK.spinnerTrack} />
        ) : (
          <SaveCheckGlyph track={DOCK.saveGreenTrack} />
        )}
      </Box>
    </Tooltip>
  );
}
