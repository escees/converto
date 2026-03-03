import { create } from "zustand";
import type { ImageFile } from "../types/image";
import type { ImageFormat } from "../types/formats";
import type {
  AspectRatio,
  ConversionProgress,
  ConversionResult,
} from "../types/conversion";

interface ConversionSettings {
  targetFormat: ImageFormat;
  quality: number;
  preserveMetadata: boolean;
  outputDirectory: string;
  resizeEnabled: boolean;
  resizeWidth: number;
  resizeHeight: number;
  aspectRatio: AspectRatio | null;
}

export type ConversionStatus = "idle" | "converting" | "complete" | "error";

interface ConversionState {
  files: ImageFile[];
  addFiles: (files: ImageFile[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFile: (id: string, updates: Partial<ImageFile>) => void;

  settings: ConversionSettings;
  setTargetFormat: (format: ImageFormat) => void;
  setQuality: (quality: number) => void;
  setPreserveMetadata: (preserve: boolean) => void;
  setOutputDirectory: (dir: string) => void;
  setResizeEnabled: (enabled: boolean) => void;
  setResizeWidth: (width: number) => void;
  setResizeHeight: (height: number) => void;
  setAspectRatio: (ratio: AspectRatio | null) => void;

  status: ConversionStatus;
  progress: ConversionProgress | null;
  result: ConversionResult | null;
  conversionDuration: number | null;
  setStatus: (status: ConversionStatus) => void;
  setProgress: (progress: ConversionProgress) => void;
  setResult: (result: ConversionResult, durationMs: number) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: ConversionSettings = {
  targetFormat: "png",
  quality: 85,
  preserveMetadata: true,
  outputDirectory: "",
  resizeEnabled: false,
  resizeWidth: 1920,
  resizeHeight: 1080,
  aspectRatio: null,
};

export const useConversionStore = create<ConversionState>((set) => ({
  files: [],
  addFiles: (newFiles) =>
    set((state) => ({
      files: [
        ...state.files,
        ...newFiles.filter(
          (f) => !state.files.some((existing) => existing.path === f.path)
        ),
      ],
    })),
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),
  clearFiles: () => set({ files: [], result: null, status: "idle" }),
  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  settings: DEFAULT_SETTINGS,
  setTargetFormat: (format) =>
    set((state) => ({
      settings: { ...state.settings, targetFormat: format },
    })),
  setQuality: (quality) =>
    set((state) => ({
      settings: { ...state.settings, quality },
    })),
  setPreserveMetadata: (preserve) =>
    set((state) => ({
      settings: { ...state.settings, preserveMetadata: preserve },
    })),
  setOutputDirectory: (dir) =>
    set((state) => ({
      settings: { ...state.settings, outputDirectory: dir },
    })),
  setResizeEnabled: (enabled) =>
    set((state) => ({
      settings: { ...state.settings, resizeEnabled: enabled },
    })),
  setResizeWidth: (width) =>
    set((state) => ({
      settings: { ...state.settings, resizeWidth: width },
    })),
  setResizeHeight: (height) =>
    set((state) => ({
      settings: { ...state.settings, resizeHeight: height },
    })),
  setAspectRatio: (ratio) =>
    set((state) => ({
      settings: { ...state.settings, aspectRatio: ratio },
    })),

  status: "idle",
  progress: null,
  result: null,
  conversionDuration: null,
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setResult: (result, durationMs) =>
    set({ result, status: "complete", conversionDuration: durationMs }),
  reset: () =>
    set({ status: "idle", progress: null, result: null, conversionDuration: null }),
}));
