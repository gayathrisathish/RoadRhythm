"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_DATA = [
  { hour: 0,  weekday: 1200, weekend: 1400 },
  { hour: 1,  weekday: 900,  weekend: 1100 },
  { hour: 2,  weekday: 700,  weekend: 900  },
  { hour: 3,  weekday: 600,  weekend: 700  },
  { hour: 4,  weekday: 800,  weekend: 600  },
  { hour: 5,  weekday: 1400, weekend: 800  },
  { hour: 6,  weekday: 2800, weekend: 1200 },
  { hour: 7,  weekday: 4200, weekend: 1600 },
  { hour: 8,  weekday: 4800, weekend: 2100 },
  { hour: 9,  weekday: 3600, weekend: 2800 },
  { hour: 10, weekday: 3100, weekend: 3200 },
  { hour: 11, weekday: 3200, weekend: 3400 },
  { hour: 12, weekday: 3400, weekend: 3500 },
  { hour: 13, weekday: 3300, weekend: 3400 },
  { hour: 14, weekday: 3500, weekend: 3300 },
  { hour: 15, weekday: 4000, weekend: 3200 },
  { hour: 16, weekday: 4900, weekend: 3100 },
  { hour: 17, weekday: 5100, weekend: 3000 },
  { hour: 18, weekday: 4200, weekend: 2800 },
  { hour: 19, weekday: 3100, weekend: 2500 },
  { hour: 20, weekday: 2400, weekend: 2200 },
  { hour: 21, weekday: 2000, weekend: 1900 },
  { hour: 22, weekday: 1700, weekend: 1700 },
  { hour: 23, weekday: 1400, weekend: 1500 },
];

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12AM";
  if (hour === 6) return "6AM";
  if (hour === 12) return "12PM";
  if (hour === 18) return "6PM";
  if (hour === 23) return "11PM";
  return "";
}

interface TooltipEntry {
  dataKey: string;
  value: number;
  color: string;
  name: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const hour = Number(label ?? 0);
  const suffix = hour >= 12 ? "PM" : "AM";
  const shown = hour % 12 === 0 ? 12 : hour % 12;
  return (
    <div
      style={{
        background: "#21262D",
        border: "0.5px solid #30363D",
        borderRadius: 6,
        padding: "6px 10px",
        fontSize: 11,
        color: "#E6EDF3",
      }}
    >
      <p style={{ marginBottom: 4, color: "#7D8590" }}>
        {shown}:00 {suffix}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()} veh/hr
        </p>
      ))}
    </div>
  );
}

function CustomLegend() {
  return (
    <div className="flex justify-center gap-4 pt-1">
      <span className="text-[11px]" style={{ color: "#F85149" }}>
        — Weekday avg
      </span>
      <span className="text-[11px]" style={{ color: "#58A6FF" }}>
        — Weekend avg
      </span>
    </div>
  );
}

export function WeekdayWeekendChart() {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface p-4">
      <p className="section-label">Weekday vs Weekend Traffic Patterns</p>
      <div className="min-h-[140px] flex-1" style={{ minHeight: 140 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={CHART_DATA} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#21262D" strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            tick={{ fill: "#7D8590", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 6, 12, 18, 23]}
            tickFormatter={formatHourLabel}
          />
          <YAxis hide domain={[0, 6000]} width={0} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceArea
            x1={7}
            x2={9}
            fill="#F85149"
            fillOpacity={0.06}
            label={{ value: "Rush hour", position: "insideTop", fontSize: 9, fill: "#7D8590" }}
          />
          <ReferenceArea
            x1={16}
            x2={18}
            fill="#F85149"
            fillOpacity={0.06}
            label={{ value: "Rush hour", position: "insideTop", fontSize: 9, fill: "#7D8590" }}
          />
          <Line
            type="monotone"
            dataKey="weekday"
            name="Weekday avg"
            stroke="#F85149"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="weekend"
            name="Weekend avg"
            stroke="#58A6FF"
            strokeWidth={2}
            dot={false}
          />
          <Legend content={<CustomLegend />} />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </section>
  );
}
