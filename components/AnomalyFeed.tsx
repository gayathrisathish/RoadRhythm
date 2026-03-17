import { type AnomalyEvent } from "@/lib/types";

interface AnomalyFeedProps {
  events: AnomalyEvent[];
}

export function AnomalyFeed({ events }: AnomalyFeedProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <p className="section-label">Anomaly Alerts</p>
      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={event.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-high-foreground" />
                <p className="text-[11px] font-normal leading-[1.6] text-muted">
                  {event.date} - {event.description}
                </p>
              </div>
              <span className="rounded-full border border-high-border bg-high px-2 py-[2px] text-[10px] font-medium text-high-foreground">
                +{event.impactPct}%
              </span>
            </div>
            {index < events.length - 1 ? <div className="h-px bg-elevated" style={{ height: "0.5px" }} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
