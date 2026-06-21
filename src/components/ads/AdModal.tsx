"use client";

import { Button, Center, Dialog, Text } from "@chakra-ui/react";
import { t } from "@/lib/i18n";

interface AdModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdModal({ open, onClose }: AdModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(details) => !details.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content className="no-print">
          <Dialog.Header>
            <Dialog.Title>{t.ads.modalTitle}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Center
              borderWidth="1px"
              borderStyle="dashed"
              borderColor="border.emphasized"
              borderRadius="md"
              minHeight="200px"
              bg="bg.subtle"
            >
              <Text fontSize="sm" color="fg.subtle">
                {t.ads.modalTitle}
              </Text>
            </Center>
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
