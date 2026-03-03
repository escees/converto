import { useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { AppShell } from "./components/layout/AppShell";
import { DropZone } from "./components/dropzone/DropZone";
import { FileList } from "./components/dropzone/FileList";
import { ConversionSettings } from "./components/settings/ConversionSettings";
import { ProgressPanel } from "./components/progress/ProgressPanel";
import { StatusBar } from "./components/layout/StatusBar";
import { useDropHandler } from "./hooks/useDropHandler";
import { useThumbnails } from "./hooks/useThumbnails";
import { useConversionStore } from "./stores/conversionStore";
import { useConversion } from "./hooks/useConversion";
import { IMAGE_EXTENSIONS } from "./constants/formats";
import { extToFormat, getFileExtension } from "./utils/formatHelpers";
import type { ImageFile } from "./types/image";

export default function App() {
  useDropHandler();
  useThumbnails();
  const files = useConversionStore((s) => s.files);
  const status = useConversionStore((s) => s.status);
  const outputDirectory = useConversionStore(
    (s) => s.settings.outputDirectory
  );
  const addFiles = useConversionStore((s) => s.addFiles);
  const { startConversion } = useConversion();

  const handleAddMore = useCallback(async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: "Images", extensions: IMAGE_EXTENSIONS }],
    });
    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      const imageFiles: ImageFile[] = paths.map((p) => {
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
      addFiles(imageFiles);
    }
  }, [addFiles]);

  const canConvert =
    files.length > 0 && outputDirectory && status !== "converting";

  return (
    <AppShell>
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: File input */}
        <div className="flex-1 flex flex-col min-w-0">
          {files.length === 0 ? (
            <DropZone />
          ) : (
            <>
              <FileList />
              {/* Add more files button */}
              <div className="px-4 pb-3">
                <button
                  onClick={handleAddMore}
                  className="w-full py-2 rounded-xl border border-dashed border-white/[0.12]
                             text-xs text-white/40 hover:text-white/60 hover:border-white/[0.2]
                             hover:bg-white/[0.03] transition-all duration-200"
                >
                  + Add more images
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right panel: Settings */}
        <div className="w-72 border-l border-white/[0.06] p-5 overflow-y-auto custom-scrollbar flex flex-col">
          <ConversionSettings />

          <div className="mt-auto pt-6">
            <button
              onClick={startConversion}
              disabled={!canConvert}
              className="glass-button-primary w-full"
            >
              {status === "converting" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Converting...
                </span>
              ) : (
                `Convert ${files.length > 0 ? files.length : ""} ${
                  files.length === 1 ? "image" : "images"
                }`
              )}
            </button>
            {files.length > 0 && !outputDirectory && (
              <p className="text-[11px] text-amber-400/60 mt-2 text-center">
                Select an output directory first
              </p>
            )}
          </div>
        </div>
      </div>

      <ProgressPanel />
      <StatusBar />
    </AppShell>
  );
}
