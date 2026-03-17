import { CommuteAdvisor } from "@/components/CommuteAdvisor";
import { DAY_NAMES, formatHour, kelvinToF, WEATHER_OPTIONS } from "@/lib/utils";

interface SidebarProps {
  dayOfWeek: number;
  hour: number;
  weather: "Clear" | "Clouds" | "Rain" | "Snow" | "Fog";
  temp: number;
  bestHour: number;
  savedMinutes: number;
  onDayChange: (value: number) => void;
  onHourChange: (value: number) => void;
  onWeatherChange: (value: "Clear" | "Clouds" | "Rain" | "Snow" | "Fog") => void;
  onTempChange: (value: number) => void;
}

export function Sidebar({
  dayOfWeek,
  hour,
  weather,
  temp,
  bestHour,
  savedMinutes,
  onDayChange,
  onHourChange,
  onWeatherChange,
  onTempChange,
}: SidebarProps) {
  return (
    <aside className="w-[240px] shrink-0 border-r border-border bg-surface p-4">
      <div className="space-y-4">
        <section>
          <p className="section-label">Scenario Inputs</p>

          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-normal text-muted">Day of week</p>
              <select
                value={dayOfWeek}
                onChange={(event) => onDayChange(Number(event.target.value))}
                className="dashboard-select"
              >
                {DAY_NAMES.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-normal text-muted">Departure hour</p>
                <span className="font-mono-metric text-xs font-medium text-primary">{formatHour(hour)}</span>
              </div>
              <input
                value={hour}
                onChange={(event) => onHourChange(Number(event.target.value))}
                type="range"
                min={0}
                max={23}
                className="dashboard-range"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-normal text-muted">Weather condition</p>
              <select
                value={weather}
                onChange={(event) => onWeatherChange(event.target.value as SidebarProps["weather"])}
                className="dashboard-select"
              >
                {WEATHER_OPTIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-normal text-muted">Temperature</p>
                <span className="font-mono-metric text-xs font-medium text-primary">
                  {temp}K / {kelvinToF(temp)}F
                </span>
              </div>
              <input
                value={temp}
                onChange={(event) => onTempChange(Number(event.target.value))}
                type="range"
                min={250}
                max={310}
                className="dashboard-range"
              />
            </div>
          </div>
        </section>

        <section>
          <p className="section-label">Smart Commute Advisor</p>
          <CommuteAdvisor bestHour={bestHour} savedMinutes={savedMinutes} />
        </section>

        <section>
          <p className="section-label">Model Info</p>
          <div className="space-y-1 text-[11px] font-normal leading-[1.6] text-muted">
            <p>Algorithm: Gradient Boosted Trees</p>
            <p>F1 score: 0.91 (macro)</p>
            <p>Split type: Temporal holdout</p>
            <p>Feature count: 28 engineered signals</p>
          </div>
        </section>
      </div>
    </aside>
  );
}
