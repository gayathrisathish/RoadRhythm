import { DAYS, TIME_SLOTS } from "@/lib/utils";

interface CongestionHeatmapProps {
  matrix: number[][];
}

const CELL_COLORS = ["#238636", "#9E6A03", "#DA3633", "#8957E5"];

export function CongestionHeatmap({ matrix }: CongestionHeatmapProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <p className="section-label">Congestion Heatmap - hour vs day</p>
      <div className="mt-1">
        <div className="mb-1 ml-10 grid grid-cols-7 gap-[2px]">
          {DAYS.map((day) => (
            <p key={day} className="text-center text-[9px] font-normal text-muted">
              {day}
            </p>
          ))}
        </div>

        <div className="space-y-[2px]">
          {TIME_SLOTS.map((slot, rowIndex) => (
            <div key={slot} className="grid grid-cols-[40px,1fr] items-center gap-2">
              <p className="text-[9px] font-normal text-muted">{slot <= 12 ? `${slot}AM` : `${slot - 12}PM`}</p>
              <div className="grid grid-cols-7 gap-[2px]">
                {matrix[rowIndex].map((value, colIndex) => (
                  <div
                    key={`${slot}-${colIndex}`}
                    className="h-[18px] rounded-[3px]"
                    style={{ backgroundColor: CELL_COLORS[value] }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
