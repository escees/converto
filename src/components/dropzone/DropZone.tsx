import { useCallback, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useConversionStore } from "../../stores/conversionStore";
import { IMAGE_EXTENSIONS } from "../../constants/formats";
import { extToFormat, getFileExtension } from "../../utils/formatHelpers";
import type { ImageFile } from "../../types/image";

export function DropZone() {
  const addFiles = useConversionStore((s) => s.addFiles);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleBrowse = useCallback(async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "Images",
          extensions: IMAGE_EXTENSIONS,
        },
      ],
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

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center m-4 p-12
                   rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                   ${
                     isDragOver
                       ? "border-accent-light/60 bg-accent/10 scale-[1.01]"
                       : "border-white/[0.12] hover:border-white/[0.25] hover:bg-white/[0.03]"
                   }`}
      onClick={handleBrowse}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => setIsDragOver(false)}
    >
      {/* Icon */}
      <div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6
                    transition-all duration-300
                    ${
                      isDragOver
                        ? "bg-accent/20 border-accent-light/30"
                        : "bg-white/[0.06] border-white/[0.08]"
                    } border`}
      >
        <svg
          className={`w-8 h-8 transition-colors duration-300 ${
            isDragOver ? "text-accent-light" : "text-white/40"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-white/80 mb-2">
        Drop images here
      </h2>
      <p className="text-sm text-white/40 mb-4">or click to browse</p>
      <div className="flex flex-wrap gap-1.5 justify-center max-w-md">
        {["HEIC", "JPEG", "PNG", "WebP", "AVIF", "TIFF", "BMP", "GIF", "ICO"].map(
          (fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 text-[10px] font-medium rounded-md
                         bg-white/[0.06] text-white/40 border border-white/[0.06]"
            >
              {fmt}
            </span>
          )
        )}
      </div>
    </div>
  );
}
