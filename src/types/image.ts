import type { ID } from "./common";

export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface ImageMeta {
  id: ID;
  url: string;
  originalUrl: string;
  width: number;
  height: number;
  crop: ImageCrop | null;
}
