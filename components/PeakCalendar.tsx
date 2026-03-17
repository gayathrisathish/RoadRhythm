"use client";

import { type CongestionLabel, type WeatherCondition } from "@/lib/types";
import { WEATHER_SEVERITY } from "@/lib/utils";

// US Federal Holidays (YYYY-MM-DD local)
const US_HOLIDAYS = new Set([
  // 2025
  "2025-01-01", "2025-01-20", "2025-02-17", "2025-05-26",
  "2025-07-04", "2025-09-01", "2025-10-13", "2025-11-11",
  "2025-11-27", "2025-12-25",
  // 2026
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-05-25",
  "2026-07-03", "2026-07-04", "2026-09-07", "2026-10-12",
  "2026-11-11", "2026-11-26", "2026-12-25",
  // 2027
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-05-31",
  "2027-07-05", "2027-09-06", "2027-10-11", "2027-11-11",
  "2027-11-25", "2027-12-24",
]);

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function predictPeakLevel(jsDay: number, weather: WeatherCondition, temp: number): CongestionLabel {
  // jsDay: 0=Sun, 6=Sat
  const isWeekend = jsDay === 0 || jsDay === 6;
  const hour = isWeekend ? 12 : 8;
  const effectiveWeather: WeatherCondition = isWeekend ? "Clear" : weather;

  // Remap JS day (0=Sun,1=Mon…) to our Mon-based index (0=Mon…6=Sun)
  const ourDay = jsDay === 0 ? 6 : jsDay - 1;

  const rush = hour >= 7 && hour <= 9 ? 2 : 0;
  const dayLoad = ourDay === 4 ? 1.4 : ourDay >= 5 ? 0.4 : 1;
  const weatherLoad = WEATHER_SEVERITY[effectiveWeather] * 0.45;
  const tempOffset = Math.abs(temp - 286) / 45;
  const score = rush + dayLoad + weatherLoad + tempOffset;

  if (score < 1.7) return "Low";
  if (score < 2.5) return "Medium";
  if (score < 3.4) return "High";
  return "Severe";
}

const LEVEL_BG: Record<CongestionLabel, string> = {
  Low:    "rgba(35, 134, 54, 0.85)",
  Medium: "rgba(158, 106, 3, 0.85)",
  High:   "rgba(218, 54, 51, 0.85)",
  Severe: "rgba(110, 64, 201, 0.85)",
};

const LEVEL_TEXT: Record<CongestionLabel, string> = {
  Low:    "#3FB950",
  Medium: "#E3B341",
  High:   "#F85149",
  Severe: "#BC8CFF",
};

const WEATHER_DOT_COLOR: Record<WeatherCondition, string> = {
  Clear:  "#3FB950",
  Clouds: "#7D8590",
  Rain:   "#58A6FF",
  Snow:   "#E6EDF3",
  Fog:    "#7D8590",
};

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface PeakCalendarProps {
  weather: WeatherCondition;
  temp: number;
}

export function PeakCalendar({ weather, temp }: PeakCalendarProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayKey = localDateKey(today);

  const firstDayOfMonth = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDow = firstDayOfMonth.getDay(); // 0=Sun

  // Build cells: leading nulls + all days + trailing nulls
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="section-label !mb-0">Peak Traffic Prediction Calendar</p>
        <p className="text-[10px] font-normal text-muted">
          {MONTH_NAMES[month]} {year} · current weather applied
        </p>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((d) => (
          <p key={d} className="text-center text-[9px] font-medium uppercase tracking-widest text-muted">
            {d}
          </p>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((date, idx) => {
          if (!date) return <div key={`_${idx}`} className="h-9 rounded-[4px]" />;

          const key = localDateKey(date);
          const isToday = key === todayKey;
          const holiday = US_HOLIDAYS.has(key);
          const level: CongestionLabel = holiday ? "Low" : predictPeakLevel(date.getDay(), weather, temp);

          // Weekends always get clear weather dot
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const dotColor = isWeekend ? WEATHER_DOT_COLOR["Clear"] : WEATHER_DOT_COLOR[weather];

          return (
            <div
              key={key}
              className="relative h-9"
              style={{
                borderRadius: "4px",
                padding: "5px 3px",
                textAlign: "center",
                cursor: "pointer",
                background: LEVEL_BG[level],
                border: isToday ? "0.5px solid #E6EDF3" : "0.5px solid transparent",
              }}
            >
              <p
                className="text-[10px] font-medium leading-none"
                style={{ color: LEVEL_TEXT[level] }}
              >
                {date.getDate()}
              </p>
              <div
                className="absolute bottom-[4px] left-[4px] h-[5px] w-[5px] rounded-full"
                style={{ background: dotColor }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
