import { formatHour } from "@/lib/utils";

interface CommuteAdvisorProps {
  bestHour: number;
  savedMinutes: number;
}

export function CommuteAdvisor({ bestHour, savedMinutes }: CommuteAdvisorProps) {
  return (
    <div
      style={{
        background: "#0D2E1A",
        border: "0.5px solid #238636",
        borderRadius: "8px",
        padding: "11px",
      }}
    >
      <p className="font-mono-metric text-[32px] font-medium leading-none text-low-foreground">{formatHour(bestHour)}</p>
      <p className="mt-2 text-xs font-normal text-low-foreground/90">Recommended departure</p>
      <p className="mt-1 text-xs font-normal text-low-foreground/80">Estimated time saved: {savedMinutes} min</p>
    </div>
  );
}
