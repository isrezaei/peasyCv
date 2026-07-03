"use client";

import { Button, Dialog, HStack, IconButton, Input, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { disableShare, enableShare, getShareStatus, type ShareLink } from "@/lib/api/resumes";
import { t } from "@/lib/i18n";
import { useResumeStore } from "@/store/useResumeStore";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Owner-facing share controls: create/disable the public read-only link for the
 * current resume and copy it. The link resolves to the unauthenticated
 * /share/:token view.
 */
export function ShareDialog({ open, onClose }: ShareDialogProps) {
  const resumeId = useResumeStore((state) => state.resume.id);
  const [link, setLink] = useState<ShareLink | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const load = async () => {
      setError(null);
      setCopied(false);
      try {
        const status = await getShareStatus(resumeId);
        if (active) setLink(status);
      } catch {
        if (active) setLink(null);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [open, resumeId]);

  const handleEnable = async () => {
    setBusy(true);
    setError(null);
    try {
      setLink(await enableShare(resumeId));
    } catch {
      setError("ابتدا یک تغییر ایجاد کنید تا رزومه ذخیره شود، سپس دوباره تلاش کنید.");
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      await disableShare(resumeId);
      setLink((prev) => (prev ? { ...prev, enabled: false } : prev));
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!link?.url) return;
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked; the field is selectable as a fallback */
    }
  };

  const isShared = Boolean(link?.enabled && link.url);

  return (
    <Dialog.Root open={open} onOpenChange={(d) => !d.open && onClose()} lazyMount unmountOnExit>
      <Dialog.Backdrop className="no-print" />
      <Dialog.Positioner className="no-print">
        <Dialog.Content className="no-print">
          <Dialog.Header>
            <Dialog.Title>اشتراک‌گذاری رزومه</Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <IconButton aria-label={t.ads.close} size="xs" variant="ghost" borderRadius="full">
                <CloseIcon />
              </IconButton>
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap="3">
              <Text color="fg.muted" fontSize="sm">
                با ایجاد لینک عمومی، هر کسی که لینک را داشته باشد می‌تواند رزومه شما را فقط
                «مشاهده» کند (بدون امکان ویرایش).
              </Text>

              {isShared ? (
                <HStack gap="2">
                  <Input value={link!.url} readOnly fontSize="sm" />
                  <Button onClick={handleCopy} colorPalette="accent" flexShrink={0}>
                    {copied ? "کپی شد!" : "کپی لینک"}
                  </Button>
                </HStack>
              ) : null}

              {error ? (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              ) : null}
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            {isShared ? (
              <Button variant="outline" colorPalette="red" loading={busy} onClick={handleDisable}>
                غیرفعال کردن لینک
              </Button>
            ) : (
              <Button colorPalette="accent" loading={busy} onClick={handleEnable}>
                ایجاد لینک عمومی
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              {t.ads.close}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
