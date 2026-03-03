import type { ImageFormat } from "../types/formats";

export const FORMAT_DISPLAY_NAMES: Record<ImageFormat, string> = {
  jpeg: "JPEG",
  png: "PNG",
  webp: "WebP",
  heic: "HEIC/HEIF",
  avif: "AVIF",
  bmp: "BMP",
  tiff: "TIFF",
  gif: "GIF",
  ico: "ICO",
};

export const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "avif",
  "bmp",
  "tiff",
  "tif",
  "gif",
  "ico",
];

export const TARGET_FORMATS: ImageFormat[] = [
  "jpeg",
  "png",
  "webp",
  "heic",
  "avif",
  "bmp",
  "tiff",
  "gif",
  "ico",
];

export const QUALITY_FORMATS: ImageFormat[] = ["jpeg", "webp", "avif", "heic"];
