import { useConversionStore } from "../../stores/conversionStore";
import { TARGET_FORMATS, FORMAT_DISPLAY_NAMES } from "../../constants/formats";

export function FormatSelector() {
  const targetFormat = useConversionStore((s) => s.settings.targetFormat);
  const setTargetFormat = useConversionStore((s) => s.setTargetFormat);

  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
        Output Format
      </label>
      <select
        value={targetFormat}
        onChange={(e) => setTargetFormat(e.target.value as typeof targetFormat)}
        className="glass-select"
      >
        {TARGET_FORMATS.map((fmt) => (
          <option key={fmt} value={fmt} className="bg-t-option text-white">
            {FORMAT_DISPLAY_NAMES[fmt]}
          </option>
        ))}
      </select>
    </div>
  );
}
