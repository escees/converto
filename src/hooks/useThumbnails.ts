import { useEffect, useRef } from "react";
import { useConversionStore } from "../stores/conversionStore";
import { generateThumbnail } from "../services/tauriCommands";

export function useThumbnails() {
  const files = useConversionStore((s) => s.files);
  const updateFile = useConversionStore((s) => s.updateFile);
  const loadingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const filesNeedingThumbnails = files.filter(
      (f) => !f.thumbnailBase64 && !loadingRef.current.has(f.id)
    );

    for (const file of filesNeedingThumbnails) {
      loadingRef.current.add(file.id);

      generateThumbnail(file.path)
        .then((response) => {
          updateFile(file.id, {
            thumbnailBase64: response.dataBase64,
            width: response.width,
            height: response.height,
          });
        })
        .catch((err) => {
          console.warn(`Thumbnail failed for ${file.fileName}:`, err);
        })
        .finally(() => {
          loadingRef.current.delete(file.id);
        });
    }
  }, [files, updateFile]);
}
