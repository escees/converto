import { useConversionStore } from "../../stores/conversionStore";
import { formatFileSize } from "../../utils/formatHelpers";

export function StatusBar() {
  const files = useConversionStore((s) => s.files);
  const status = useConversionStore((s) => s.status);

  const totalSize = files.reduce((sum, f) => sum + f.fileSizeBytes, 0);

  return (
    <footer className="px-6 py-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/40">
      <div className="flex items-center gap-4">
        <span>
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
        {totalSize > 0 && <span>{formatFileSize(totalSize)} total</span>}
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            status === "idle"
              ? "bg-white/30"
              : status === "converting"
                ? "bg-amber-400 animate-pulse"
                : status === "complete"
                  ? "bg-emerald-400"
                  : "bg-red-400"
          }`}
        />
        <span className="capitalize">{status === "idle" ? "Ready" : status}</span>
      </div>
    </footer>
  );
}
