import type { ImageFormat } from "./formats";

export type AspectRatio =
  | "16:9"
  | "4:3"
  | "1:1"
  | "3:2"
  | "9:16"
  | "3:4"
  | "2:3";

export interface EncodingOptions {
  format: ImageFormat;
  quality: number | null;
  preserveMetadata: boolean;
  resizeWidth: number | null;
  resizeHeight: number | null;
  aspectRatio: AspectRatio | null;
}

export interface ConversionRequest {
  inputPaths: string[];
  outputDirectory: string;
  options: EncodingOptions;
}

export interface ConversionResult {
  total: number;
  succeeded: number;
  failed: number;
  results: FileConversionResult[];
}

export interface FileConversionResult {
  inputPath: string;
  outputPath: string | null;
  success: boolean;
  error: string | null;
  outputSizeBytes: number | null;
}

export interface ConversionProgress {
  currentIndex: number;
  totalFiles: number;
  currentFile: string;
  stage: ProcessingStage;
}

export type ProcessingStage =
  | "decoding"
  | "converting"
  | "encoding"
  | "writingMetadata"
  | "complete"
  | "failed";
