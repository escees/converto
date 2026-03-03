import { useConversionStore } from "../../stores/conversionStore";

export function ResizeSetting() {
  const resizeEnabled = useConversionStore((s) => s.settings.resizeEnabled);
  const resizeWidth = useConversionStore((s) => s.settings.resizeWidth);
  const resizeHeight = useConversionStore((s) => s.settings.resizeHeight);
  const setResizeEnabled = useConversionStore((s) => s.setResizeEnabled);
  const setResizeWidth = useConversionStore((s) => s.setResizeWidth);
  const setResizeHeight = useConversionStore((s) => s.setResizeHeight);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Resize
          </label>
          <p className="text-[11px] text-white/30 mt-0.5">
            Set custom output dimensions
          </p>
        </div>
        <button
          onClick={() => setResizeEnabled(!resizeEnabled)}
          className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
            resizeEnabled
              ? "bg-accent shadow-lg shadow-accent/30"
              : "bg-white/[0.1]"
          }`}
          role="switch"
          aria-checked={resizeEnabled}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                        transition-transform duration-300 ${
                          resizeEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
          />
        </button>
      </div>

      {resizeEnabled && (
        <div className="mt-3 flex items-center gap-2 animate-fade-in">
          <input
            type="number"
            min={1}
            max={99999}
            value={resizeWidth}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) setResizeWidth(v);
            }}
            className="w-20 px-2 py-1.5 text-sm text-white/90 bg-white/[0.06] border border-white/[0.08] rounded-lg
                       focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30
                       placeholder-white/30 text-center"
            placeholder="Width"
          />
          <span className="text-white/30 text-sm font-medium">&times;</span>
          <input
            type="number"
            min={1}
            max={99999}
            value={resizeHeight}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) setResizeHeight(v);
            }}
            className="w-20 px-2 py-1.5 text-sm text-white/90 bg-white/[0.06] border border-white/[0.08] rounded-lg
                       focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30
                       placeholder-white/30 text-center"
            placeholder="Height"
          />
          <span className="text-[11px] text-white/30">px</span>
        </div>
      )}
    </div>
  );
}
