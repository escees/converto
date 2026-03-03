import { useState, useRef, useEffect } from "react";
import {
  useThemeStore,
  THEME_LABELS,
  type ThemeName,
} from "../../stores/themeStore";

const THEMES = Object.keys(THEME_LABELS) as ThemeName[];

export function ThemeSelector() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/50
                   hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200"
      >
        {THEME_LABELS[theme]}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-lg bg-t-bg-2 border border-white/[0.14] shadow-2xl animate-fade-in z-50">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors duration-150 ${
                theme === t
                  ? "text-accent-light bg-accent/10"
                  : "text-white/60 hover:text-white/80 hover:bg-white/[0.06]"
              }`}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
