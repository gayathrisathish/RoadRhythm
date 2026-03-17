import { NextResponse } from "next/server";

import { type PredictRequest, type PredictResponse } from "@/lib/types";

const FASTAPI_URL = process.env.FASTAPI_URL;

function buildMockPrediction(payload: PredictRequest): PredictResponse {
  const weather = payload.weather_severity;
  const rush = payload.is_rush_hour;
  const fridayBoost = payload.day_of_week === 4 ? 1 : 0;
  const weekendDrop = payload.is_weekend ? -1 : 0;
  const tempShift = Math.abs(payload.temp - 286) > 10 ? 0.4 : 0;
  const score = weather * 0.8 + rush * 1.3 + fridayBoost * 1.1 + weekendDrop + tempShift;

  let congestion_level: PredictResponse["congestion_level"] = "Low";
  if (score >= 0.9) congestion_level = "Medium";
  if (score >= 2) congestion_level = "High";
  if (score >= 3) congestion_level = "Severe";

  const base = {
    Low: 12,
    Medium: 22,
    High: 44,
    Severe: 22,
  };

  if (congestion_level === "Low") {
    base.Low = 62;
    base.Medium = 24;
    base.High = 10;
    base.Severe = 4;
  }
  if (congestion_level === "Medium") {
    base.Low = 20;
    base.Medium = 48;
    base.High = 24;
    base.Severe = 8;
  }
  if (congestion_level === "High") {
    base.Low = 8;
    base.Medium = 22;
    base.High = 54;
    base.Severe = 16;
  }
  if (congestion_level === "Severe") {
    base.Low = 4;
    base.Medium = 12;
    base.High = 36;
    base.Severe = 48;
  }

  // Friday 8AM + rain forces a dramatic opening state.
  if (payload.day_of_week === 4 && payload.hour === 8 && payload.weather_severity >= 2) {
    congestion_level = "High";
    base.Low = 4;
    base.Medium = 16;
    base.High = 61;
    base.Severe = 19;
  }

  const confidence = Math.min(99, Math.max(71, 76 + weather * 4 + rush * 6 + fridayBoost * 3));
  const best_hour = payload.day_of_week >= 5 ? 11 : 11;

  return {
    congestion_level,
    confidence,
    probabilities: base,
    best_hour,
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PredictRequest;

    if (FASTAPI_URL) {
      const upstream = await fetch(`${FASTAPI_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (upstream.ok) {
        const data = (await upstream.json()) as PredictResponse;
        return NextResponse.json(data);
      }
    }

    return NextResponse.json(buildMockPrediction(payload));
  } catch {
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 });
  }
}
