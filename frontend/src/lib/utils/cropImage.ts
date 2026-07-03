export interface CropOffset {
  x: number;
  y: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * Renders the same translate+scale transform used by the crop preview onto an
 * off-screen canvas so the exported square matches exactly what the user saw.
 */
export async function cropImageToDataUrl(
  src: string,
  viewportSize: number,
  zoom: number,
  offset: CropOffset,
  outputSize: number,
): Promise<string> {
  const image = await loadImage(src);
  const baseScale = Math.max(viewportSize / image.naturalWidth, viewportSize / image.naturalHeight);
  const finalScale = baseScale * zoom;
  const drawWidth = image.naturalWidth * finalScale;
  const drawHeight = image.naturalHeight * finalScale;
  const dx = (viewportSize - drawWidth) / 2 + offset.x;
  const dy = (viewportSize - drawHeight) / 2 + offset.y;

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const outputScale = outputSize / viewportSize;
  ctx.drawImage(
    image,
    dx * outputScale,
    dy * outputScale,
    drawWidth * outputScale,
    drawHeight * outputScale,
  );

  return canvas.toDataURL("image/jpeg", 0.9);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
