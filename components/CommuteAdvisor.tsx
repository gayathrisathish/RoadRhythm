"use client";

import { formatHour } from "@/lib/utils";
import { useTheme } from "next-themes";

interface CommuteAdvisorProps {
  bestHour: number;
  savedMinutes: number;
}

export function CommuteAdvisor({ bestHour, savedMinutes }: CommuteAdvisorProps) {
  const { theme } = useTheme();
  const isDark = (theme ?? "dark") === "dark";

  return (
    <div
      style={{
        background: isDark ? "#0D2E1A" : "#DAFBE1",
        border: `0.5px solid ${isDark ? "#238636" : "#82CFAC"}`,
        borderRadius: "8px",
        padding: "11px",
      }}
    >
      <p className="font-mono-metric text-[32px] font-medium leading-none" style={{ color: isDark ? "#3FB950" : "#1A7F37" }}>{formatHour(bestHour)}</p>
      <p className="mt-2 text-xs font-normal text-low-foreground/90">Recommended departure</p>
      <p className="mt-1 text-xs font-normal text-low-foreground/80">Estimated time saved: {savedMinutes} min</p>
    </div>
  );
}
