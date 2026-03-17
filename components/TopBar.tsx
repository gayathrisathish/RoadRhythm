"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

interface TopBarProps {
  alertLabel: string;
}

export function TopBar({ alertLabel }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (theme ?? "dark") === "dark";

  return (
    <header className="h-12 border-b border-border bg-surface px-4">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#3FB950",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <p className="text-[14px] font-medium">
            <span style={{ color: "var(--accent)", fontWeight: 500 }}>RoadRhythm</span>
            <span style={{ color: "var(--muted)", margin: "0 6px" }}>—</span>
            <span style={{ color: "var(--primary)" }}>Urban Traffic Intelligence</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-[12px] font-normal">
          <p className="text-muted">Chennai Metropolitan Area</p>
          <span
            className="rounded-full px-2 py-[2px] text-[11px] font-medium"
            style={{
              border: `0.5px solid ${isDark ? "#DA3633" : "#FF8182"}`,
              background: isDark ? "#2D0E0E" : "#FFEBE9",
              color: isDark ? "#F85149" : "#CF222E",
            }}
          >
            {alertLabel}
          </span>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="grid h-8 w-8 place-items-center rounded-md border"
            style={{ borderColor: isDark ? "#30363D" : "#D0D7DE", background: "transparent" }}
          >
            {mounted && isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <p className="text-accent">Live prediction</p>
        </div>
      </div>
    </header>
  );
}
