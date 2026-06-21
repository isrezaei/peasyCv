"use client";

import { Avatar, Box, HStack, IconButton } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { CameraIcon, TrashIcon, UserIcon } from "@/components/ui/icons";
import { usePersonalInfo } from "@/hooks/store/usePersonalInfo";
import { t } from "@/lib/i18n";
import { createId } from "@/lib/utils/id";
import { readFileAsDataUrl } from "@/lib/utils/cropImage";
import { ImageCropModal } from "./ImageCropModal";

interface ProfileImageEditorProps {
  size?: string;
}

export function ProfileImageEditor({ size = "88px" }: ProfileImageEditorProps) {
  const { personalInfo, setProfileImage, removeProfileImage } = usePersonalInfo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);

  const shape = personalInfo.photoStyle === "square" ? "rounded" : "full";
  const iconSize = Math.round(Number.parseInt(size, 10) * 0.52);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setPendingImageSrc(dataUrl);
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    if (!pendingImageSrc) return;
    setProfileImage({
      id: createId(),
      url: croppedDataUrl,
      originalUrl: pendingImageSrc,
      width: 480,
      height: 480,
      crop: null,
    });
    setPendingImageSrc(null);
  };

  return (
    <Box className="group" position="relative" width={size} height={size} flexShrink={0}>
      <Avatar.Root width={size} height={size} shape={shape} bg="blackAlpha.50" color="fg.subtle">
        <Avatar.Fallback>
          <UserIcon size={iconSize} aria-label={t.personalInfo.profileImage} />
        </Avatar.Fallback>
        {personalInfo.profileImage ? <Avatar.Image src={personalInfo.profileImage.url} /> : null}
      </Avatar.Root>

      <HStack
        className="no-print"
        position="absolute"
        bottom="-2"
        insetInlineStart="50%"
        transform="translateX(50%)"
        gap="1"
        opacity="0"
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.12s"
      >
        <IconButton
          aria-label={personalInfo.profileImage ? t.personalInfo.replaceImage : t.personalInfo.uploadImage}
          size="2xs"
          borderRadius="full"
          colorPalette="accent"
          onClick={() => fileInputRef.current?.click()}
        >
          <CameraIcon />
        </IconButton>
        {personalInfo.profileImage ? (
          <IconButton
            aria-label={t.personalInfo.deleteImage}
            size="2xs"
            borderRadius="full"
            colorPalette="red"
            variant="solid"
            onClick={removeProfileImage}
          >
            <TrashIcon />
          </IconButton>
        ) : null}
      </HStack>

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelected} />
      {pendingImageSrc ? (
        <ImageCropModal
          open
          imageSrc={pendingImageSrc}
          onCancel={() => setPendingImageSrc(null)}
          onConfirm={handleCropConfirm}
        />
      ) : null}
    </Box>
  );
}
