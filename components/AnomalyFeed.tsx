import { type AnomalyEvent } from "@/lib/types";

interface AnomalyFeedProps {
  events: AnomalyEvent[];
}

function severityTone(severity: AnomalyEvent["severity"]) {
  if (severity === "critical") {
    return {
      dot: "#F85149",
      badgeBg: "#2D0E0E",
      badgeText: "#F85149",
      badgeBorder: "#DA3633",
    };
  }
  if (severity === "high") {
    return {
      dot: "#E3B341",
      badgeBg: "#2D1F00",
      badgeText: "#E3B341",
      badgeBorder: "#9E6A03",
    };
  }
  return {
    dot: "#58A6FF",
    badgeBg: "#0C1F3A",
    badgeText: "#58A6FF",
    badgeBorder: "#1F6FEB",
  };
}

export function AnomalyFeed({ events }: AnomalyFeedProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <p className="section-label">Anomaly Alerts</p>
      <div className="space-y-2">
        {events.map((event, index) => {
          const tone = severityTone(event.severity);
          return (
          <div key={event.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: tone.dot }} />
                <p className="text-[12.5px] font-normal leading-[1.6] text-muted">
                  {event.date} - {event.description}
                </p>
              </div>
              <span
                className="rounded-full border px-2 py-[2px] text-[11px] font-medium"
                style={{
                  borderColor: tone.badgeBorder,
                  background: tone.badgeBg,
                  color: tone.badgeText,
                }}
              >
                +{event.impactPct}%
              </span>
            </div>
            {index < events.length - 1 ? <div className="h-px bg-elevated" style={{ height: "0.5px" }} /> : null}
          </div>
          );
        })}
      </div>
    </section>
  );
}
