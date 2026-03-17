"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
  Tooltip,
  Legend,
} from "recharts";

import { CongestionHeatmap } from "@/components/CongestionHeatmap";
import { MetricCard } from "@/components/MetricCard";
import { ProbabilityBars } from "@/components/ProbabilityBars";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { ShapChart } from "@/components/ShapChart";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
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

const WEEK_TREND = [
  { hour: 0, weekday: 1200, weekend: 1400 },
  { hour: 1, weekday: 900, weekend: 1100 },
  { hour: 2, weekday: 700, weekend: 900 },
  { hour: 3, weekday: 600, weekend: 700 },
  { hour: 4, weekday: 800, weekend: 600 },
  { hour: 5, weekday: 1400, weekend: 800 },
  { hour: 6, weekday: 2800, weekend: 1200 },
  { hour: 7, weekday: 4200, weekend: 1600 },
  { hour: 8, weekday: 4800, weekend: 2100 },
  { hour: 9, weekday: 3600, weekend: 2800 },
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

const WEATHER_IMPACT = [
  { weather: "Clear", score: 18, color: "#3FB950" },
  { weather: "Rain", score: 64, color: "#58A6FF" },
  { weather: "Fog", score: 47, color: "#E3B341" },
];

const ISOLATION_FOREST = [
  { feature: "Queue length", score: 0.91 },
  { feature: "Speed drop", score: 0.86 },
  { feature: "Lane closure", score: 0.79 },
  { feature: "Rain surge", score: 0.74 },
  { feature: "Signal drift", score: 0.68 },
];

export default function Dashboard() {
  const [inputs, setInputs] = useState(DEFAULT_STATE);
  const [prediction, setPrediction] = useState<PredictResponse>(DEFAULT_PREDICTION);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"predictor" | "patterns" | "anomalies">("predictor");

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
          background: "#161B22",
          borderBottom: "0.5px solid #30363D",
          display: "flex",
          padding: "0 16px",
          gap: "2px",
        }}
      >
        {[
          { id: "predictor", label: "Live Predictor" },
          { id: "patterns", label: "Pattern Intelligence" },
          { id: "anomalies", label: "Anomaly Command" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              height: "40px",
              padding: "0 14px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #58A6FF" : "2px solid transparent",
              color: activeTab === tab.id ? "#E6EDF3" : "#7D8590",
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
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

        <main style={{ overflowY: "auto", background: "#0D1117" }}>
          {activeTab === "predictor" && (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  alignItems: "stretch",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <CongestionHeatmap matrix={heatmap} selectedHour={inputs.hour} selectedDay={inputs.dayOfWeek} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <ShapChart data={STATIC_SHAP} />
                  <div
                    style={{
                      background: "#161B22",
                      border: "0.5px solid #30363D",
                      borderRadius: "8px",
                      padding: "14px",
                      flex: 1,
                    }}
                  >
                    <p style={{ fontSize: "11px", color: "#7D8590", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Class Probabilities
                    </p>
                    <ProbabilityBars probabilities={prediction.probabilities} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "patterns" && (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {[
                  { label: "Peak hour", value: "08:00 AM", sub: "Morning rush apex" },
                  { label: "Avg weekday load", value: "3,010", sub: "vehicles/hour" },
                  { label: "Weekend delta", value: "-27%", sub: "lower than weekdays" },
                  { label: "Pattern confidence", value: "91%", sub: "stable temporal signal" },
                ].map((card) => (
                  <div key={card.label} style={{ background: "#161B22", border: "0.5px solid #30363D", borderRadius: "8px", padding: "12px" }}>
                    <p style={{ fontSize: "10px", color: "#7D8590", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>{card.label}</p>
                    <p style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: "24px", color: "#E6EDF3", marginBottom: "6px" }}>{card.value}</p>
                    <p style={{ fontSize: "12px", color: "#7D8590" }}>{card.sub}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#161B22", border: "0.5px solid #30363D", borderRadius: "8px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: "#7D8590", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Hourly Volume Signature
                  </p>
                  <div style={{ height: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={WEEK_TREND} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                        <CartesianGrid stroke="#21262D" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hour" tick={{ fill: "#7D8590", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="weekday" radius={3}>
                          {WEEK_TREND.map((d) => (
                            <Cell key={`bar-${d.hour}`} fill={d.hour >= 7 && d.hour <= 9 ? "#F85149" : "#58A6FF"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: "#161B22", border: "0.5px solid #30363D", borderRadius: "8px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: "#7D8590", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Weekday vs Weekend Patterns
                  </p>
                  <div style={{ height: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={WEEK_TREND} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                        <CartesianGrid stroke="#21262D" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hour" tick={{ fill: "#7D8590", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend />
                        <ReferenceArea x1={7} x2={9} fill="#F85149" fillOpacity={0.08} />
                        <ReferenceArea x1={16} x2={18} fill="#F85149" fillOpacity={0.08} />
                        <Line type="monotone" dataKey="weekday" stroke="#F85149" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="weekend" stroke="#58A6FF" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {WEATHER_IMPACT.map((w) => (
                  <div key={w.weather} style={{ background: "#161B22", border: "0.5px solid #30363D", borderRadius: "8px", padding: "12px" }}>
                    <p style={{ fontSize: "10px", color: "#7D8590", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                      {w.weather} impact
                    </p>
                    <p style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: "24px", color: w.color, marginBottom: "6px" }}>{w.score}%</p>
                    <p style={{ fontSize: "12px", color: "#7D8590" }}>Contribution to peak congestion intensity</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "anomalies" && (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: "#2D0E0E", border: "0.5px solid #DA3633", borderRadius: "8px", padding: "12px" }}>
                <p style={{ fontSize: "11px", color: "#F85149", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Live Alert Stream
                </p>
                <p style={{ fontSize: "13px", color: "#E6EDF3" }}>
                  Isolation Forest triggered high-confidence anomaly cluster in Chennai corridor.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#161B22", border: "0.5px solid #30363D", borderRadius: "8px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: "#7D8590", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Anomaly Feed
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {STATIC_ANOMALIES.map((a) => (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", borderBottom: "0.5px solid #21262D", paddingBottom: "8px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              marginTop: "6px",
                              background: a.severity === "critical" ? "#F85149" : a.severity === "high" ? "#E3B341" : "#58A6FF",
                            }}
                          />
                          <p style={{ fontSize: "12px", color: "#7D8590" }}>{a.date} - {a.description}</p>
                        </div>
                        <span style={{ fontSize: "11px", color: "#F85149", border: "0.5px solid #DA3633", background: "#2D0E0E", borderRadius: "9999px", padding: "2px 8px", height: "fit-content" }}>
                          +{a.impactPct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "#161B22", border: "0.5px solid #30363D", borderRadius: "8px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: "#7D8590", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Isolation Forest Scores
                  </p>
                  <div style={{ height: "260px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ISOLATION_FOREST} layout="vertical" margin={{ top: 4, right: 4, left: 8, bottom: 4 }}>
                        <CartesianGrid stroke="#21262D" strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 1]} tick={{ fill: "#7D8590", fontSize: 10 }} tickLine={false} axisLine={false} />
                        <XAxis hide />
                        <Tooltip />
                        <Bar dataKey="score" radius={3} fill="#F85149" barSize={10}>
                          {ISOLATION_FOREST.map((v) => (
                            <Cell key={v.feature} fill={v.score > 0.85 ? "#F85149" : v.score > 0.75 ? "#E3B341" : "#58A6FF"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
