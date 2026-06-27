"use client";

import { Button, Dialog, IconButton } from "@chakra-ui/react";
import AdvertisingUi from "@/components/ads/advertising.ui";
import { CloseIcon } from "@/components/ui/icons";
import { t } from "@/lib/i18n";

interface AdModalProps {
  open: boolean;
  onClose: () => void;
  /** The ad placement id to show (one ad per modal). */
  adId: string;
}

/**
 * A dismissible advertisement modal showing ONE ad. `lazyMount`/`unmountOnExit`
 * mean the ad slot mounts fresh on every open (and unmounts on close), so the
 * Yektanet unit reliably re-renders each time it is shown — the same re-render
 * coordinator the sidebar slots use. Everything carries `no-print`, and the modal
 * is mounted only in the editor shell (never the print route), so it can NEVER
 * appear in the exported PDF.
 */
export function AdModal({ open, onClose, adId }: AdModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => !details.open && onClose()}
      lazyMount
      unmountOnExit
    >
      <Dialog.Backdrop className="no-print" />
      <Dialog.Positioner className="no-print">
        <Dialog.Content className="no-print">
          <Dialog.Header>
            <Dialog.Title>{t.ads.modalTitle}</Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <IconButton aria-label={t.ads.close} size="xs" variant="ghost" colorPalette="gray" borderRadius="full">
                <CloseIcon />
              </IconButton>
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body>
            <AdvertisingUi AdvertisingId={adId} isShow height={260} />
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose}>
              {t.ads.close}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
