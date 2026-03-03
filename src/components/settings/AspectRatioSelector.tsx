import { useConversionStore } from "../../stores/conversionStore";
import type { AspectRatio } from "../../types/conversion";

const RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "3:2", label: "3:2" },
  { value: "1:1", label: "1:1" },
  { value: "2:3", label: "2:3" },
  { value: "3:4", label: "3:4" },
  { value: "9:16", label: "9:16" },
];

export function AspectRatioSelector() {
  const aspectRatio = useConversionStore((s) => s.settings.aspectRatio);
  const setAspectRatio = useConversionStore((s) => s.setAspectRatio);

  return (
    <div>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        Aspect Ratio
      </label>
      <p className="text-[11px] text-white/30 mt-0.5 mb-2">
        Crop to a specific proportion
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setAspectRatio(null)}
          className={`px-2.5 py-1 text-xs rounded-md transition-all duration-200 ${
            aspectRatio === null
              ? "bg-accent/30 text-accent-light border border-accent/40"
              : "bg-white/[0.06] text-white/40 border border-white/[0.06] hover:bg-white/[0.1] hover:text-white/60"
          }`}
        >
          Original
        </button>
        {RATIOS.map((r) => (
          <button
            key={r.value}
            onClick={() =>
              setAspectRatio(aspectRatio === r.value ? null : r.value)
            }
            className={`px-2.5 py-1 text-xs rounded-md transition-all duration-200 ${
              aspectRatio === r.value
                ? "bg-accent/30 text-accent-light border border-accent/40"
                : "bg-white/[0.06] text-white/40 border border-white/[0.06] hover:bg-white/[0.1] hover:text-white/60"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
