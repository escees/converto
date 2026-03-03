import { create } from "zustand";

export type ThemeName = "aurora" | "catppuccin" | "dracula" | "nord";

export const THEME_LABELS: Record<ThemeName, string> = {
  aurora: "Aurora",
  catppuccin: "Catppuccin",
  dracula: "Dracula",
  nord: "Nord",
};

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

function loadTheme(): ThemeName {
  const stored = localStorage.getItem("converto-theme");
  if (stored && stored in THEME_LABELS) return stored as ThemeName;
  return "aurora";
}

function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("converto-theme", theme);
}

// Apply saved theme immediately on load
applyTheme(loadTheme());

export const useThemeStore = create<ThemeState>((set) => ({
  theme: loadTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
