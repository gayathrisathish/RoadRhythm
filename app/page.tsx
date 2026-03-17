"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
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
  estimateTimeSaved,
  getBadgeText,
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
  { weather: "Clear", score: 18 },
  { weather: "Rain", score: 64 },
  { weather: "Fog", score: 47 },
];

const ISOLATION_FOREST = [
  { feature: "Queue length", score: 0.91 },
  { feature: "Speed drop", score: 0.86 },
  { feature: "Lane closure", score: 0.79 },
  { feature: "Rain surge", score: 0.74 },
  { feature: "Signal drift", score: 0.68 },
];

export default function Dashboard() {
  const { resolvedTheme } = useTheme();
  const [inputs, setInputs] = useState(DEFAULT_STATE);
  const [congestionLevel, setCongestionLevel] = useState<PredictResponse["congestion_level"]>(DEFAULT_PREDICTION.congestion_level);
  const [confidence, setConfidence] = useState(DEFAULT_PREDICTION.confidence);
  const [probabilities, setProbabilities] = useState(DEFAULT_PREDICTION.probabilities);
  const [bestHour, setBestHour] = useState(DEFAULT_PREDICTION.best_hour);
  const [predictedVolume, setPredictedVolume] = useState(5640);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"predictor" | "patterns" | "anomalies">("predictor");

  const isDark =
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : (resolvedTheme ?? "dark") === "dark";

  const c = {
    canvas: isDark ? "#0D1117" : "#F6F8FA",
    surface: isDark ? "#161B22" : "#FFFFFF",
    elevated: isDark ? "#21262D" : "#F0F2F4",
    border: isDark ? "#30363D" : "#D0D7DE",
    muted: isDark ? "#7D8590" : "#57606A",
    primary: isDark ? "#E6EDF3" : "#1F2328",
    accent: isDark ? "#58A6FF" : "#0969DA",

    low: isDark ? "#2EA043" : "#1A7F37",
    medium: isDark ? "#BB8009" : "#7D4E00",
    high: isDark ? "#E5534B" : "#CF222E",
    severe: isDark ? "#7C4DFF" : "#8250DF",

    lowBg: isDark ? "#0D2E1A" : "#DAFBE1",
    medBg: isDark ? "#2D1F00" : "#FFF8C5",
    highBg: isDark ? "#2D0E0E" : "#FFEBE9",
    sevBg: isDark ? "#200A20" : "#FBEFFF",

    lowBorder: isDark ? "#238636" : "#82CFAC",
    medBorder: isDark ? "#9E6A03" : "#D4A72C",
    highBorder: isDark ? "#DA3633" : "#FF8182",
    sevBorder: isDark ? "#8957E5" : "#C297FF",
  };

  const hour = inputs.hour;
  const dayOfWeek = inputs.dayOfWeek;
  const temp = inputs.temp;
  const weatherSeverityByType: Record<WeatherCondition, number> = {
    Clear: 0,
    Clouds: 1,
    Rain: 2,
    Snow: 3,
    Fog: 2,
  };
  const weatherSeverity = weatherSeverityByType[inputs.weather];

  const savedMinutes = estimateTimeSaved(inputs.hour, bestHour);
  const heatmap = buildHeatmapMatrix(inputs);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchPrediction = async (
    requestHour: number,
    requestDayOfWeek: number,
    requestWeatherSeverity: number,
    requestTemp: number
  ) => {
    const isWeekend = requestDayOfWeek >= 5 ? 1 : 0;
    const isRushHour = [7, 8, 9, 16, 17, 18].includes(requestHour) ? 1 : 0;

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hour: requestHour,
          day_of_week: requestDayOfWeek,
          is_weekend: isWeekend,
          is_rush_hour: isRushHour,
          weather_severity: requestWeatherSeverity,
          temp: requestTemp,
        }),
      });
      if (!res.ok) throw new Error("Prediction failed");
      return await res.json();
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPrediction(hour, dayOfWeek, weatherSeverity, temp)
      .then((data) => {
        if (!data) return;
        setCongestionLevel(data.congestion_level);
        setConfidence(data.confidence);
        setProbabilities(data.probabilities);
        setBestHour(data.best_hour);
        setPredictedVolume(data.predicted_volume);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, dayOfWeek, hour, temp, weatherSeverity]);

  const congestionColor =
    congestionLevel === "Low"
      ? c.low
      : congestionLevel === "Medium"
        ? c.medium
        : congestionLevel === "High"
          ? c.high
          : c.severe;

  const latestAlertLabel = STATIC_ANOMALIES[0]?.severity === "critical" ? "CHENNAI LIVE" : "SEVERE ALERT";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <TopBar alertLabel={latestAlertLabel} />
      <div
        style={{
          background: c.surface,
          borderBottom: `0.5px solid ${c.border}`,
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
              borderBottom: activeTab === tab.id ? `2px solid ${c.accent}` : "2px solid transparent",
              color: activeTab === tab.id ? c.primary : c.muted,
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

        <main style={{ overflowY: "auto", background: c.canvas }}>
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
                  value={<span style={{ color: congestionColor }}>{congestionLevel}</span>}
                  subtitle="Congestion classification"
                  loading={loading}
                  badgeLevel={congestionLevel}
                  badgeText={getBadgeText(congestionLevel)}
                />
                <RiskScoreCard
                  probabilities={probabilities}
                  weather={inputs.weather}
                  hour={inputs.hour}
                  confidence={confidence}
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
                      background: c.surface,
                      border: `0.5px solid ${c.border}`,
                      borderRadius: "8px",
                      padding: "14px",
                      flex: 1,
                    }}
                  >
                    <p style={{ fontSize: "11px", color: c.muted, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Class Probabilities
                    </p>
                    <ProbabilityBars probabilities={probabilities} />
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
                  <div key={card.label} style={{ background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: "8px", padding: "12px" }}>
                    <p style={{ fontSize: "10px", color: c.muted, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>{card.label}</p>
                    <p style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: "24px", color: c.primary, marginBottom: "6px" }}>{card.value}</p>
                    <p style={{ fontSize: "12px", color: c.muted }}>{card.sub}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: "8px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: c.muted, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Hourly Volume Signature
                  </p>
                  <div style={{ height: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={WEEK_TREND} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                        <CartesianGrid stroke={c.elevated} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hour" tick={{ fill: c.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: c.surface, border: `0.5px solid ${c.border}` }} />
                        <Bar dataKey="weekday" radius={3}>
                          {WEEK_TREND.map((d) => (
                            <Cell key={`bar-${d.hour}`} fill={d.hour >= 7 && d.hour <= 9 ? c.high : c.accent} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: "8px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: c.muted, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Weekday vs Weekend Patterns
                  </p>
                  <div style={{ height: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={WEEK_TREND} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                        <CartesianGrid stroke={c.elevated} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hour" tick={{ fill: c.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: c.surface, border: `0.5px solid ${c.border}` }} />
                        <Legend />
                        <ReferenceArea x1={7} x2={9} fill={c.high} fillOpacity={0.08} />
                        <ReferenceArea x1={16} x2={18} fill={c.high} fillOpacity={0.08} />
                        <Line type="monotone" dataKey="weekday" stroke={c.high} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="weekend" stroke={c.accent} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {WEATHER_IMPACT.map((w) => (
                  <div key={w.weather} style={{ background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: "8px", padding: "12px" }}>
                    <p style={{ fontSize: "10px", color: c.muted, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                      {w.weather} impact
                    </p>
                    <p style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: "24px", color: w.weather === "Clear" ? c.low : w.weather === "Rain" ? c.accent : c.medium, marginBottom: "6px" }}>{w.score}%</p>
                    <p style={{ fontSize: "12px", color: c.muted }}>Contribution to peak congestion intensity</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "anomalies" && (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: c.highBg, border: `0.5px solid ${c.highBorder}`, borderRadius: "8px", padding: "12px" }}>
                <p style={{ fontSize: "11px", color: c.high, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Live Alert Stream
                </p>
                <p style={{ fontSize: "13px", color: c.primary }}>
                  Isolation Forest triggered high-confidence anomaly cluster in Chennai corridor.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: "8px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: c.muted, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Anomaly Feed
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {STATIC_ANOMALIES.map((a) => (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", borderBottom: `0.5px solid ${c.elevated}`, paddingBottom: "8px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              marginTop: "6px",
                              background: a.severity === "critical" ? c.high : a.severity === "high" ? c.medium : c.accent,
                            }}
                          />
                          <p style={{ fontSize: "12px", color: c.muted }}>{a.date} - {a.description}</p>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: a.severity === "critical" ? c.high : a.severity === "high" ? c.medium : c.accent,
                            border: `0.5px solid ${a.severity === "critical" ? c.highBorder : a.severity === "high" ? c.medBorder : c.accent}`,
                            background: a.severity === "critical" ? (isDark ? "#2D0E0E" : "#FFEBE9") : a.severity === "high" ? (isDark ? "#2D1F00" : "#FFF8C5") : (isDark ? "#0C1F3A" : "#EBF5FF"),
                            borderRadius: "9999px",
                            padding: "2px 8px",
                            height: "fit-content",
                          }}
                        >
                          +{a.impactPct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: c.surface, border: `0.5px solid ${c.border}`, borderRadius: "8px", padding: "14px" }}>
                  <p style={{ fontSize: "11px", color: c.muted, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Isolation Forest Scores
                  </p>
                  <div style={{ height: "260px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ISOLATION_FOREST} layout="vertical" margin={{ top: 4, right: 4, left: 8, bottom: 4 }}>
                        <CartesianGrid stroke={c.elevated} strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 1]} tick={{ fill: c.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
                        <XAxis hide />
                        <Tooltip contentStyle={{ background: c.surface, border: `0.5px solid ${c.border}` }} />
                        <Bar dataKey="score" radius={3} fill={c.high} barSize={10}>
                          {ISOLATION_FOREST.map((v) => (
                            <Cell key={v.feature} fill={v.score > 0.85 ? c.high : v.score > 0.75 ? c.medium : c.accent} />
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
