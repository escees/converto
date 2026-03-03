import { useConversionStore } from "../../stores/conversionStore";
import { QUALITY_FORMATS } from "../../constants/formats";

export function QualitySlider() {
  const targetFormat = useConversionStore((s) => s.settings.targetFormat);
  const quality = useConversionStore((s) => s.settings.quality);
  const setQuality = useConversionStore((s) => s.setQuality);

  if (!QUALITY_FORMATS.includes(targetFormat)) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Quality
        </label>
        <span className="text-sm font-mono text-white/70">{quality}%</span>
      </div>
      <input
        type="range"
        min={1}
        max={100}
        value={quality}
        onChange={(e) => setQuality(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                   bg-white/[0.1] accent-accent
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-accent-light
                   [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-accent/30
                   [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent-light/50
                   [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150
                   [&::-webkit-slider-thumb]:hover:scale-110"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-white/30">Small file</span>
        <span className="text-[10px] text-white/30">Best quality</span>
      </div>
    </div>
  );
}
