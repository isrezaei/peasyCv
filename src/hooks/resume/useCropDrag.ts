import { useCallback, useRef, useState, type PointerEvent } from "react";
import type { CropOffset } from "@/lib/utils/cropImage";

export function useCropDrag(initial: CropOffset = { x: 0, y: 0 }) {
  const [offset, setOffset] = useState<CropOffset>(initial);
  const dragStart = useRef<{ x: number; y: number; offset: CropOffset } | null>(null);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      dragStart.current = { x: event.clientX, y: event.clientY, offset };
    },
    [offset],
  );

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setOffset({ x: dragStart.current.offset.x + dx, y: dragStart.current.offset.y + dy });
  }, []);

  const onPointerUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  return { offset, setOffset, onPointerDown, onPointerMove, onPointerUp };
}
