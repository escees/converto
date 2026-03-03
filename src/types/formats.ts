export type ImageFormat =
  | "jpeg"
  | "png"
  | "webp"
  | "heic"
  | "avif"
  | "bmp"
  | "tiff"
  | "gif"
  | "ico";

export interface FormatInfo {
  format: ImageFormat;
  displayName: string;
  extensions: string[];
  supportsQuality: boolean;
  supportsLossless: boolean;
  supportsExif: boolean;
}
