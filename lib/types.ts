export type CongestionLabel = "Low" | "Medium" | "High" | "Severe";

export interface ScenarioInputs {
  dayOfWeek: number;
  hour: number;
  weather: WeatherCondition;
  temp: number;
}

export type WeatherCondition = "Clear" | "Clouds" | "Rain" | "Snow" | "Fog";

export interface PredictRequest {
  hour: number;
  day_of_week: number;
  is_weekend: number;
  is_rush_hour: number;
  weather_severity: number;
  temp: number;
}

export interface PredictResponse {
  congestion_level: CongestionLabel;
  confidence: number;
  probabilities: {
    Low: number;
    Medium: number;
    High: number;
    Severe: number;
  };
  best_hour: number;
}

export interface AnomalyEvent {
  id: string;
  date: string;
  description: string;
  impactPct: number;
}

export interface ShapDriver {
  feature: string;
  value: number;
}
