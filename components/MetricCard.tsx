import { type ReactNode } from "react";

import { type CongestionLabel } from "@/lib/types";
import { getBadgeText } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  subtitle: string;
  loading?: boolean;
  badgeLevel?: CongestionLabel;
  badgeText?: string;
}

export function CongestionBadge({ level, text }: { level: CongestionLabel; text?: string }) {
  const tone =
    level === "Low"
      ? "bg-low text-low-foreground border-low-border"
      : level === "Medium"
        ? "bg-medium text-medium-foreground border-medium-border"
        : level === "High"
          ? "bg-high text-high-foreground border-high-border"
          : "bg-severe text-severe-foreground border-severe-border";

  return (
    <span className={`inline-flex rounded-full border px-2 py-[2px] text-[11px] font-medium tracking-[0.06em] ${tone}`}>
      {text ?? getBadgeText(level)}
    </span>
  );
}

export function MetricCard({ label, value, subtitle, loading, badgeLevel, badgeText }: MetricCardProps) {
  return (
    <article
      className={`rounded-lg border border-border bg-surface p-4 transition-[border-color] duration-150 ease-in-out hover:border-[#484F58] ${
        loading ? "metric-loading" : ""
      }`}
    >
      <p className="section-label !text-[10px]">{label}</p>
      <div className="mb-2 font-mono-metric text-[26px] font-medium leading-none text-primary">{value}</div>
      <p className="text-xs font-normal text-muted">{subtitle}</p>
      {badgeLevel ? (
        <div className="mt-2">
          <CongestionBadge level={badgeLevel} text={badgeText} />
        </div>
      ) : null}
    </article>
  );
}
