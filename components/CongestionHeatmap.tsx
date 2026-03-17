"use client";

import { Fragment } from "react";

import { DAYS, TIME_SLOTS } from "@/lib/utils";

interface CongestionHeatmapProps {
  matrix: number[][];
  selectedHour: number;
  selectedDay: number;
}

const CELL_COLORS = ["#2EA043", "#BB8009", "#E5534B", "#7C4DFF"];
const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function rowIntensity(hour: number, dayIndex: number): number {
  const isWeekday = dayIndex <= 4;
  if (!isWeekday) {
    return hour === 8 ? 0.82 : hour === 6 || hour === 10 ? 0.68 : 0.6;
  }
  if (hour === 8) return 1;
  if (hour === 16 || hour === 18) return 0.82;
  if (hour === 6 || hour === 10) return 0.68;
  return 0.6;
}

function nearestSlotRow(hour: number): number {
  let nearest = 0;
  let best = Number.POSITIVE_INFINITY;
  TIME_SLOTS.forEach((slot, index) => {
    const diff = Math.abs(slot - hour);
    if (diff < best) {
      best = diff;
      nearest = index;
    }
  });
  return nearest;
}

export function CongestionHeatmap({ matrix, selectedHour, selectedDay }: CongestionHeatmapProps) {
  const selectedRow = nearestSlotRow(selectedHour);

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <p className="section-label">Congestion Heatmap - hour vs day</p>
      <div className="mt-1" style={{ display: "grid", gridTemplateColumns: "30px repeat(7, 1fr)", gap: "3px" }}>
        <div />
        {DAYS.map((day) => (
          <p key={day} className="text-center text-[10px] font-normal text-muted">
            {day}
          </p>
        ))}

        {TIME_SLOTS.map((slot, rowIndex) => (
          <Fragment key={`row-${slot}`}>
            <p key={`label-${slot}`} className="text-[10px] font-normal text-muted">
              {slot <= 12 ? `${slot}AM` : `${slot - 12}PM`}
            </p>
            {matrix[rowIndex].map((value, colIndex) => {
              const isSelected = rowIndex === selectedRow && colIndex === selectedDay;
              const label = `${DAY_FULL[colIndex]} ${slot <= 12 ? `${slot}AM` : `${slot - 12}PM`} — ${
                value === 0 ? "Low" : value === 1 ? "Medium" : value === 2 ? "High" : "Severe"
              } congestion`;

              return (
                <div key={`${slot}-${colIndex}`} className="group relative heatmap-cell-shell">
                  <div
                    className="heatmap-cell"
                    style={{
                      height: "24px",
                      borderRadius: "4px",
                      background: CELL_COLORS[value],
                      opacity: rowIntensity(slot, colIndex),
                      cursor: "pointer",
                      boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.07)",
                      transform: isSelected ? "scale(1.06)" : undefined,
                      zIndex: isSelected ? 2 : 1,
                      transition: isSelected ? "all 150ms ease" : undefined,
                    }}
                  />
                  <div className="heatmap-tooltip pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap group-hover:block">
                    {label}
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
