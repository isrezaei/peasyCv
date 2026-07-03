import type { ImageMeta } from "@/types";
import { apiFetch, apiJson } from "./client";

/**
 * Upload (or replace) a profile image. The cropped image is sent as multipart
 * form-data; the backend stores it in cloud storage and returns an ImageMeta the
 * caller assigns to personalInfo.profileImage. Passing the previous asset id
 * removes the old object after the new one is stored.
 */
export function uploadProfileImage(
  blob: Blob,
  filename: string,
  replaceAssetId?: string,
): Promise<ImageMeta> {
  const form = new FormData();
  form.append("file", blob, filename);
  if (replaceAssetId) form.append("replaceAssetId", replaceAssetId);
  return apiJson<ImageMeta>("/uploads/profile-image", { method: "POST", body: form });
}

export async function deleteUploadedImage(assetId: string): Promise<void> {
  await apiFetch(`/uploads/${assetId}`, { method: "DELETE" });
}
