import type { ReactNode } from "react";
import { ThemeSelector } from "../settings/ThemeSelector";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-t-bg-1 via-t-bg-2 to-t-bg-3 text-white overflow-hidden">
      {/* Ambient background orbs for glassmorphism depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-accent-sec/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-accent-light/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Title bar area */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-light to-accent-sec flex items-center justify-center text-sm font-bold shadow-lg shadow-accent/30">
              C
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white/90">
              Converto
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <span className="text-xs text-white/30">v0.1.0</span>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
