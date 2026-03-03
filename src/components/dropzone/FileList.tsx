import { useConversionStore } from "../../stores/conversionStore";
import { FORMAT_DISPLAY_NAMES } from "../../constants/formats";
import { formatFileSize } from "../../utils/formatHelpers";
import type { ImageFile } from "../../types/image";

function FileListItem({ file }: { file: ImageFile }) {
  const removeFile = useConversionStore((s) => s.removeFile);

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 animate-fade-in">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/[0.06] flex-shrink-0 flex items-center justify-center">
        {file.thumbnailBase64 ? (
          <img
            src={`data:image/png;base64,${file.thumbnailBase64}`}
            alt={file.fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white/20 animate-pulse-soft"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/85 truncate">
          {file.fileName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/[0.08] text-white/50">
            {FORMAT_DISPLAY_NAMES[file.format]}
          </span>
          {file.width && file.height && (
            <span className="text-[11px] text-white/35">
              {file.width} × {file.height}
            </span>
          )}
          {file.fileSizeBytes > 0 && (
            <span className="text-[11px] text-white/35">
              {formatFileSize(file.fileSizeBytes)}
            </span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => removeFile(file.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/[0.1] transition-all duration-200"
        aria-label={`Remove ${file.fileName}`}
      >
        <svg
          className="w-4 h-4 text-white/40 hover:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export function FileList() {
  const files = useConversionStore((s) => s.files);
  const clearFiles = useConversionStore((s) => s.clearFiles);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white/60">
          {files.length} {files.length === 1 ? "image" : "images"} queued
        </h2>
        <button
          onClick={clearFiles}
          className="text-xs text-white/40 hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {files.map((file) => (
          <FileListItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
}
