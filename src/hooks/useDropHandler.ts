import { useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { useConversionStore } from "../stores/conversionStore";
import { IMAGE_EXTENSIONS } from "../constants/formats";
import { extToFormat, getFileExtension } from "../utils/formatHelpers";
import type { ImageFile } from "../types/image";

interface TauriDropPayload {
  paths: string[];
  position: { x: number; y: number };
}

export function useDropHandler() {
  const addFiles = useConversionStore((s) => s.addFiles);

  const handleDrop = useCallback(
    (paths: string[]) => {
      const imageFiles: ImageFile[] = paths
        .filter((p) => {
          const ext = getFileExtension(p.split(/[/\\]/).pop() ?? "");
          return IMAGE_EXTENSIONS.includes(ext);
        })
        .map((p) => {
          const fileName = p.split(/[/\\]/).pop() ?? "unknown";
          const ext = getFileExtension(fileName);
          return {
            id: crypto.randomUUID(),
            path: p,
            fileName,
            format: extToFormat(ext),
            fileSizeBytes: 0,
          };
        });

      if (imageFiles.length > 0) {
        addFiles(imageFiles);
      }
    },
    [addFiles]
  );

  useEffect(() => {
    const unlisten = listen<TauriDropPayload>("tauri://drag-drop", (event) => {
      handleDrop(event.payload.paths);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [handleDrop]);
}
