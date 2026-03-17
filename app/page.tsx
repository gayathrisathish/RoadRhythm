"use client";

import { useCallback, useEffect, useState } from "react";

import { AnomalyFeed } from "@/components/AnomalyFeed";
import { CongestionHeatmap } from "@/components/CongestionHeatmap";
import { MetricCard } from "@/components/MetricCard";
import { PeakCalendar } from "@/components/PeakCalendar";
import { ProbabilityBars } from "@/components/ProbabilityBars";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { ShapChart } from "@/components/ShapChart";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { WeekdayWeekendChart } from "@/components/WeekdayWeekendChart";
import {
  type AnomalyEvent,
  type PredictResponse,
  type ShapDriver,
  type WeatherCondition,
} from "@/lib/types";
import {
  buildHeatmapMatrix,
  estimateBestHourClient,
  estimateTimeSaved,
  getBadgeText,
  toApiPayload,
} from "@/lib/utils";

const STATIC_ANOMALIES: AnomalyEvent[] = [
  { id: "a1", date: "Mar 14 08:22", description: "Critical queue spillback — Kathipara Junction inbound", impactPct: 41, severity: "critical" },
  { id: "a2", date: "Mar 13 17:05", description: "Signal failure cluster — OMR corridor evening outbound", impactPct: 29, severity: "high" },
  { id: "a3", date: "Mar 12 06:47", description: "Rain surge delay — Guindy to Saidapet arterial", impactPct: 24, severity: "medium" },
  { id: "a4", date: "Mar 11 07:58", description: "Ramp merge friction — Mount Road flyover approach", impactPct: 18, severity: "high" },
  { id: "a5", date: "Mar 09 16:30", description: "Localized lane blockage — Velachery MRTS underpass", impactPct: 22, severity: "medium" },
];

const STATIC_SHAP: ShapDriver[] = [
  { feature: "Rush Hour Flag", value: 0.92 },
  { feature: "Day: Friday", value: 0.78 },
  { feature: "Weather Severity", value: 0.64 },
  { feature: "Temperature (K)", value: 0.47 },
  { feature: "Weekend Flag", value: 0.31 },
];

const DEFAULT_STATE = {
  dayOfWeek: 4,
  hour: 8,
  weather: "Rain" as WeatherCondition,
  temp: 287,
};

const DEFAULT_PREDICTION: PredictResponse = {
  congestion_level: "High",
  confidence: 87,
  probabilities: { Low: 4, Medium: 16, High: 61, Severe: 19 },
  best_hour: 11,
};

export default function Dashboard() {
  const [inputs, setInputs] = useState(DEFAULT_STATE);
  const [prediction, setPrediction] = useState<PredictResponse>(DEFAULT_PREDICTION);
  const [loading, setLoading] = useState(false);

  const bestHour = estimateBestHourClient(inputs);
  const savedMinutes = estimateTimeSaved(inputs.hour, bestHour);
  const heatmap = buildHeatmapMatrix(inputs);

  const fetchPrediction = useCallback(
    async (current: typeof DEFAULT_STATE) => {
      setLoading(true);
      try {
        const response = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            toApiPayload({
              dayOfWeek: current.dayOfWeek,
              hour: current.hour,
              weather: current.weather,
              temp: current.temp,
            })
          ),
        });
        if (response.ok) {
          const data = (await response.json()) as PredictResponse;
          setPrediction(data);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchPrediction(inputs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  const volumeByLevel: Record<string, number> = {
    Low: 1420,
    Medium: 3180,
    High: 5640,
    Severe: 7820,
  };
  const predictedVolume = volumeByLevel[prediction.congestion_level] ?? 5640;

  const congestionColor =
    prediction.congestion_level === "Low"
      ? "#3FB950"
      : prediction.congestion_level === "Medium"
        ? "#E3B341"
        : prediction.congestion_level === "High"
          ? "#F85149"
          : "#BC8CFF";

  const latestAlertLabel = STATIC_ANOMALIES[0]?.severity === "critical" ? "CHENNAI LIVE" : "SEVERE ALERT";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <TopBar alertLabel={latestAlertLabel} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          minHeight: "560px",
        }}
        className="flex-1 overflow-hidden"
      >
        <Sidebar
          dayOfWeek={inputs.dayOfWeek}
          hour={inputs.hour}
          weather={inputs.weather}
          temp={inputs.temp}
          bestHour={bestHour}
          savedMinutes={savedMinutes}
          onDayChange={(v) => setInputs((prev) => ({ ...prev, dayOfWeek: v }))}
          onHourChange={(v) => setInputs((prev) => ({ ...prev, hour: v }))}
          onWeatherChange={(v) => setInputs((prev) => ({ ...prev, weather: v }))}
          onTempChange={(v) => setInputs((prev) => ({ ...prev, temp: v }))}
        />

        <main className="flex flex-1 flex-col gap-3 overflow-y-auto bg-canvas p-4">
          {/* Row 1 — 3 metric cards */}
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="Predicted Volume"
              value={predictedVolume.toLocaleString()}
              subtitle="vehicles / hour"
              loading={loading}
            />
            <MetricCard
              label="Congestion Level"
              value={<span style={{ color: congestionColor }}>{prediction.congestion_level}</span>}
              subtitle="Congestion classification"
              loading={loading}
              badgeLevel={prediction.congestion_level}
              badgeText={getBadgeText(prediction.congestion_level)}
            />
            <RiskScoreCard
              probabilities={prediction.probabilities}
              weather={inputs.weather}
              hour={inputs.hour}
              confidence={prediction.confidence}
              loading={loading}
            />
          </div>

          {/* Row 2 — Heatmap left | SHAP + Probability + WeekdayWeekend right */}
          <div className="bottom-grid">
            <div className="flex flex-col gap-3">
              <CongestionHeatmap matrix={heatmap} selectedHour={inputs.hour} selectedDay={inputs.dayOfWeek} />
            </div>
            <div className="flex h-full flex-col gap-3">
              <ShapChart data={STATIC_SHAP} />
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="section-label">Class Probabilities</p>
                <ProbabilityBars probabilities={prediction.probabilities} />
              </div>
              <WeekdayWeekendChart />
            </div>
          </div>

          {/* Row 3 — Full-width peak calendar */}
          <PeakCalendar weather={inputs.weather} temp={inputs.temp} />

          {/* Row 4 — Full-width anomaly feed */}
          <AnomalyFeed events={STATIC_ANOMALIES} />
        </main>
      </div>
    </div>
  );
}
