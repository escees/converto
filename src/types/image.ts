import type { ImageFormat } from "./formats";

export interface ImageFile {
  id: string;
  path: string;
  fileName: string;
  format: ImageFormat;
  fileSizeBytes: number;
  width?: number;
  height?: number;
  hasExif?: boolean;
  thumbnailBase64?: string;
}

export interface ImageInfo {
  path: string;
  fileName: string;
  format: ImageFormat;
  width: number;
  height: number;
  fileSizeBytes: number;
  hasExif: boolean;
  colorSpace: string;
}

export interface ThumbnailResponse {
  dataBase64: string;
  width: number;
  height: number;
}
