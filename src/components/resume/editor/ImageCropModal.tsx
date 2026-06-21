"use client";

import { Box, Button, Dialog, HStack, Slider } from "@chakra-ui/react";
import { useState } from "react";
import { useCropDrag } from "@/hooks/resume/useCropDrag";
import { t } from "@/lib/i18n";
import { cropImageToDataUrl } from "@/lib/utils/cropImage";

const VIEWPORT_SIZE = 240;
const OUTPUT_SIZE = 480;

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

export function ImageCropModal({ open, imageSrc, onCancel, onConfirm }: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const { offset, onPointerDown, onPointerMove, onPointerUp } = useCropDrag();
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    setIsSaving(true);
    const dataUrl = await cropImageToDataUrl(imageSrc, VIEWPORT_SIZE, zoom, offset, OUTPUT_SIZE);
    setIsSaving(false);
    onConfirm(dataUrl);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(details) => !details.open && onCancel()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{t.personalInfo.cropImage}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Box
              width={`${VIEWPORT_SIZE}px`}
              height={`${VIEWPORT_SIZE}px`}
              mx="auto"
              borderRadius="full"
              overflow="hidden"
              bg="bg.muted"
              cursor="grab"
              touchAction="none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary data URLs need direct img + canvas transform math */}
              <img
                src={imageSrc}
                alt=""
                draggable={false}
                width="100%"
                height="100%"
                style={{
                  objectFit: "cover",
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  userSelect: "none",
                }}
              />
            </Box>
            <Slider.Root
              mt="6"
              min={1}
              max={3}
              step={0.05}
              value={[zoom]}
              onValueChange={(details) => setZoom(details.value[0])}
            >
              <Slider.Control>
                <Slider.Track>
                  <Slider.Range />
                </Slider.Track>
                <Slider.Thumb index={0} />
              </Slider.Control>
            </Slider.Root>
          </Dialog.Body>
          <Dialog.Footer>
            <HStack>
              <Button variant="ghost" onClick={onCancel}>
                {t.personalInfo.cancel}
              </Button>
              <Button colorPalette="accent" onClick={handleConfirm} loading={isSaving}>
                {t.personalInfo.save}
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
