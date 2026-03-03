import { useCallback } from "react";
import { useConversionStore } from "../stores/conversionStore";
import { convertImages } from "../services/tauriCommands";
import type { ConversionRequest } from "../types/conversion";

export function useConversion() {
  const files = useConversionStore((s) => s.files);
  const settings = useConversionStore((s) => s.settings);
  const setStatus = useConversionStore((s) => s.setStatus);
  const setProgress = useConversionStore((s) => s.setProgress);
  const setResult = useConversionStore((s) => s.setResult);

  const startConversion = useCallback(async () => {
    if (files.length === 0 || !settings.outputDirectory) return;

    const request: ConversionRequest = {
      inputPaths: files.map((f) => f.path),
      outputDirectory: settings.outputDirectory,
      options: {
        format: settings.targetFormat,
        quality: settings.quality,
        preserveMetadata: settings.preserveMetadata,
        resizeWidth: settings.resizeEnabled ? settings.resizeWidth : null,
        resizeHeight: settings.resizeEnabled ? settings.resizeHeight : null,
        aspectRatio: settings.aspectRatio,
      },
    };

    setStatus("converting");
    const startTime = performance.now();

    try {
      const result = await convertImages(request, (progress) => {
        setProgress(progress);
      });
      const durationMs = performance.now() - startTime;
      setResult(result, durationMs);
    } catch (err) {
      setStatus("error");
      console.error("Conversion failed:", err);
    }
  }, [files, settings, setStatus, setProgress, setResult]);

  return { startConversion };
}
