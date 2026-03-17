import { formatHour } from "@/lib/utils";

interface CommuteAdvisorProps {
  bestHour: number;
  savedMinutes: number;
}

export function CommuteAdvisor({ bestHour, savedMinutes }: CommuteAdvisorProps) {
  return (
    <div className="rounded-lg border border-low-border bg-low p-3">
      <p className="section-label !mb-1">Smart Commute Advisor</p>
      <p className="font-mono-metric text-[22px] font-medium leading-none text-low-foreground">{formatHour(bestHour)}</p>
      <p className="mt-2 text-xs font-normal text-low-foreground/90">Recommended departure</p>
      <p className="mt-1 text-xs font-normal text-low-foreground/80">Estimated time saved: {savedMinutes} min</p>
    </div>
  );
}
