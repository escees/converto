import { useConversionStore } from "../../stores/conversionStore";

export function MetadataToggle() {
  const preserveMetadata = useConversionStore(
    (s) => s.settings.preserveMetadata
  );
  const setPreserveMetadata = useConversionStore((s) => s.setPreserveMetadata);

  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          EXIF Metadata
        </label>
        <p className="text-[11px] text-white/30 mt-0.5">
          Preserve camera data, GPS, etc.
        </p>
      </div>
      <button
        onClick={() => setPreserveMetadata(!preserveMetadata)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
          preserveMetadata
            ? "bg-accent shadow-lg shadow-accent/30"
            : "bg-white/[0.1]"
        }`}
        role="switch"
        aria-checked={preserveMetadata}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                      transition-transform duration-300 ${
                        preserveMetadata ? "translate-x-5" : "translate-x-0"
                      }`}
        />
      </button>
    </div>
  );
}
