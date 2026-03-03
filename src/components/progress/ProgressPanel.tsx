import { useState } from "react";
import { useConversionStore } from "../../stores/conversionStore";
import { formatFileSize, formatDuration } from "../../utils/formatHelpers";
import type { FileConversionResult } from "../../types/conversion";

function getFileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

function FailedFilesList({ failures }: { failures: FileConversionResult[] }) {
  return (
    <div className="mt-3 max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar">
      {failures.map((f, i) => (
        <div
          key={i}
          className="flex items-start gap-2 text-xs bg-red-500/[0.06] border border-red-500/10 rounded-lg px-3 py-2"
        >
          <svg
            className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0"
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
          <div className="min-w-0">
            <p className="text-white/70 font-medium truncate">
              {getFileName(f.inputPath)}
            </p>
            <p className="text-red-400/80 mt-0.5 break-words">
              {f.error ?? "Unknown error"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressPanel() {
  const status = useConversionStore((s) => s.status);
  const progress = useConversionStore((s) => s.progress);
  const result = useConversionStore((s) => s.result);
  const duration = useConversionStore((s) => s.conversionDuration);
  const [showErrors, setShowErrors] = useState(false);

  if (status === "idle") return null;

  if (status === "converting" && progress) {
    const percent = Math.round(
      ((progress.currentIndex + (progress.stage === "complete" ? 1 : 0.5)) /
        progress.totalFiles) *
        100
    );

    const stageLabels: Record<string, string> = {
      decoding: "Decoding",
      converting: "Processing",
      encoding: "Encoding",
      writingMetadata: "Writing metadata",
      complete: "Done",
      failed: "Failed",
    };

    return (
      <div className="mx-4 mb-3 glass-panel p-4 animate-slide-up">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-light animate-pulse" />
            <span className="text-white/70 truncate max-w-xs">
              {progress.currentFile}
            </span>
            <span className="text-white/40">
              — {stageLabels[progress.stage] ?? progress.stage}
            </span>
          </div>
          <span className="text-white/50 text-xs font-mono">
            {progress.currentIndex + 1}/{progress.totalFiles}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-sec transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  if (status === "complete" && result) {
    const totalOutputSize = result.results.reduce(
      (sum, r) => sum + (r.outputSizeBytes ?? 0),
      0
    );
    const failures = result.results.filter((r) => !r.success);
    const hasFailures = failures.length > 0;

    return (
      <div className="mx-4 mb-3 glass-panel p-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                hasFailures ? "bg-amber-500/20" : "bg-emerald-500/20"
              }`}
            >
              {hasFailures ? (
                <svg
                  className="w-4 h-4 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                Conversion complete
              </p>
              <p className="text-xs text-white/40">
                {result.succeeded} succeeded
                {hasFailures && (
                  <span className="text-red-400">
                    , {result.failed} failed
                  </span>
                )}
                {totalOutputSize > 0 && (
                  <span> — {formatFileSize(totalOutputSize)} output</span>
                )}
                {duration != null && (
                  <span> — {formatDuration(duration)}</span>
                )}
              </p>
            </div>
          </div>
          {hasFailures && (
            <button
              onClick={() => setShowErrors(!showErrors)}
              className="text-xs text-red-400/80 hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-red-500/10"
            >
              {showErrors ? "Hide details" : "Show details"}
            </button>
          )}
        </div>
        {showErrors && hasFailures && <FailedFilesList failures={failures} />}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-4 mb-3 glass-panel p-4 border-red-500/20 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-sm text-red-400">Conversion failed</p>
        </div>
      </div>
    );
  }

  return null;
}
