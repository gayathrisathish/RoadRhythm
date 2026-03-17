import { type CongestionLabel, type ScenarioInputs, type WeatherCondition } from "@/lib/types";

export const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const WEATHER_OPTIONS: WeatherCondition[] = [
  "Clear",
  "Clouds",
  "Rain",
  "Snow",
  "Fog",
];

export const TIME_SLOTS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

export const WEATHER_SEVERITY: Record<WeatherCondition, number> = {
  Clear: 0,
  Clouds: 1,
  Rain: 2,
  Snow: 3,
  Fog: 4,
};

export const CONGESTION_LEVELS: CongestionLabel[] = ["Low", "Medium", "High", "Severe"];

const LEVEL_TO_INT: Record<CongestionLabel, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Severe: 3,
};

export function toApiPayload(inputs: ScenarioInputs) {
  return {
    hour: inputs.hour,
    day_of_week: inputs.dayOfWeek,
    is_weekend: inputs.dayOfWeek >= 5 ? 1 : 0,
    is_rush_hour: inputs.hour >= 7 && inputs.hour <= 9 ? 1 : inputs.hour >= 16 && inputs.hour <= 19 ? 1 : 0,
    weather_severity: WEATHER_SEVERITY[inputs.weather],
    temp: inputs.temp,
  };
}

export function formatHour(hour: number): string {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const shown = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${shown.toString().padStart(2, "0")}:00 ${suffix}`;
}

export function kelvinToF(temp: number): number {
  return Math.round(((temp - 273.15) * 9) / 5 + 32);
}

export function getCongestionLevelIndex(level: CongestionLabel): number {
  return LEVEL_TO_INT[level];
}

export function estimateBestHourClient(inputs: ScenarioInputs): number {
  let bestHour = 11;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let hour = 0; hour < 24; hour += 1) {
    const rushPenalty = hour >= 7 && hour <= 9 ? 28 : hour >= 16 && hour <= 19 ? 24 : 8;
    const weatherPenalty = WEATHER_SEVERITY[inputs.weather] * 10;
    const dayPenalty = inputs.dayOfWeek === 4 ? 18 : inputs.dayOfWeek >= 5 ? -6 : 10;
    const tempPenalty = Math.abs(inputs.temp - 286) / 2;
    const shoulderBonus = hour >= 10 && hour <= 14 ? -10 : 0;
    const score = rushPenalty + weatherPenalty + dayPenalty + tempPenalty + shoulderBonus;

    if (score < bestScore) {
      bestScore = score;
      bestHour = hour;
    }
  }

  return bestHour;
}

export function estimateTimeSaved(currentHour: number, bestHour: number): number {
  const rushWeight = (hour: number) => (hour >= 7 && hour <= 9 ? 24 : hour >= 16 && hour <= 19 ? 20 : 8);
  const delta = rushWeight(currentHour) - rushWeight(bestHour);
  return Math.max(0, delta);
}

export function buildHeatmapMatrix(inputs: ScenarioInputs): number[][] {
  return TIME_SLOTS.map((slotHour) => {
    return DAYS.map((_, dayIndex) => {
      const rush = slotHour >= 7 && slotHour <= 9 ? 2 : slotHour >= 16 && slotHour <= 19 ? 2 : 0;
      const dayLoad = dayIndex === 4 ? 1.4 : dayIndex >= 5 ? 0.4 : 1;
      const weatherLoad = WEATHER_SEVERITY[inputs.weather] * 0.45;
      const tempOffset = Math.abs(inputs.temp - 286) / 45;
      const score = rush + dayLoad + weatherLoad + tempOffset;
      if (score < 1.7) return 0;
      if (score < 2.5) return 1;
      if (score < 3.4) return 2;
      return 3;
    });
  });
}

export function getCongestionTone(level: number) {
  if (level === 0) return "text-low-foreground";
  if (level === 1) return "text-medium-foreground";
  if (level === 2) return "text-high-foreground";
  return "text-severe-foreground";
}

export function getBadgeText(level: CongestionLabel): string {
  if (level === "Low") return "Flowing conditions";
  if (level === "Medium") return "Moderate slowdowns";
  if (level === "High") return "Heavy delays expected";
  return "Critical saturation";
}
