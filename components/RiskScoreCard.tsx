"use client";

import { type PredictResponse } from "@/lib/types";
import { WEATHER_SEVERITY } from "@/lib/utils";
import { type WeatherCondition } from "@/lib/types";

interface RiskScoreCardProps {
  probabilities: PredictResponse["probabilities"];
  weather: WeatherCondition;
  hour: number;
  confidence: number;
  loading?: boolean;
}

function scoreColor(score: number): string {
  if (score <= 30) return "#3FB950";
  if (score <= 60) return "#E3B341";
  if (score <= 80) return "#F85149";
  return "#BC8CFF";
}

function scoreTier(score: number): string {
  if (score <= 30) return "LOW RISK WINDOW";
  if (score <= 60) return "MODERATE RISK WINDOW";
  if (score <= 80) return "HIGH RISK WINDOW";
  return "CRITICAL RISK WINDOW";
}

export function computeRiskScore(
  probabilities: PredictResponse["probabilities"],
  weatherSeverity: number,
  isRushHour: boolean
): number {
  const base = (probabilities.High / 100) * 60 + (probabilities.Severe / 100) * 100;
  const weatherPenalty = weatherSeverity * 8;
  const rushPenalty = isRushHour ? 15 : 0;
  return Math.min(Math.round(base + weatherPenalty + rushPenalty), 100);
}

export function RiskScoreCard({ probabilities, weather, hour, confidence, loading }: RiskScoreCardProps) {
  const weatherSeverity = WEATHER_SEVERITY[weather];
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
  const riskScore = computeRiskScore(probabilities, weatherSeverity, isRushHour);
  const color = scoreColor(riskScore);

  return (
    <article
      className={`rounded-lg border border-border bg-surface p-4 transition-[border-color] duration-150 ease-in-out hover:border-[#484F58] ${loading ? "metric-loading" : ""}`}
    >
      <p className="section-label !text-[10px]">Congestion Risk Score</p>

      <div className="font-mono-metric text-[28px] font-medium leading-none" style={{ color }}>
        {riskScore}
      </div>

      {/* Segmented bar */}
      <div className="relative mb-2 mt-3">
        <div className="flex h-[6px] w-full overflow-hidden rounded-full">
          <div className="flex-1" style={{ background: "#238636" }} />
          <div className="flex-1" style={{ background: "#9E6A03" }} />
          <div className="flex-1" style={{ background: "#DA3633" }} />
          <div className="flex-1" style={{ background: "#6E40C9" }} />
        </div>
        {/* Indicator dot — transitions smoothly */}
        <div
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{
            left: `${riskScore}%`,
            transition: "left 400ms cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>

      <p className="text-[10px] font-medium uppercase tracking-[0.06em]" style={{ color }}>
        {scoreTier(riskScore)}
      </p>
      <p className="mt-2 text-[11px] font-normal text-muted">{confidence}% model confidence · GBT</p>
    </article>
  );
}
