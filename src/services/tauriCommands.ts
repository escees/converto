import { invoke, Channel } from "@tauri-apps/api/core";
import type {
  ConversionRequest,
  ConversionResult,
  ConversionProgress,
} from "../types/conversion";
import type { ImageInfo, ThumbnailResponse } from "../types/image";
import type { FormatInfo } from "../types/formats";

export async function convertImages(
  request: ConversionRequest,
  onProgress: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  const channel = new Channel<ConversionProgress>();
  channel.onmessage = onProgress;

  return invoke<ConversionResult>("convert_images", {
    request,
    onProgress: channel,
  });
}

export async function getImageInfo(path: string): Promise<ImageInfo> {
  return invoke<ImageInfo>("get_image_info", { path });
}

export async function generateThumbnail(
  path: string
): Promise<ThumbnailResponse> {
  return invoke<ThumbnailResponse>("generate_thumbnail", { path });
}

export async function getSupportedFormats(): Promise<FormatInfo[]> {
  return invoke<FormatInfo[]>("get_supported_formats");
}
