export interface WeatherDemand {
  status: "available" | "unavailable";
  location: string;
  summary: string;
  temperatureC?: number;
  observedAt?: string;
  traffic: "normal" | "reduced" | "low" | "unknown";
  discountPoints: number;
  reason: string;
}

// Starting business rules, not a forecast trained on store sales.
export function estimateWeatherDemand(code: number, temperatureC: number, windMps: number, rainMm: number) {
  const severe = (code >= 200 && code < 300) || (code >= 600 && code < 700)
    || code === 781 || windMps >= 14 || rainMm >= 4 || temperatureC >= 38 || temperatureC <= 0;
  const moderate = (code >= 300 && code < 600) || (code >= 700 && code < 800)
    || windMps >= 8 || temperatureC >= 32;
  return severe
    ? { traffic: "low" as const, discountPoints: 10, reason: "Harsh weather may discourage store visits." }
    : moderate
      ? { traffic: "reduced" as const, discountPoints: 5, reason: "Rain, reduced visibility, heat or wind may reduce store visits." }
      : { traffic: "normal" as const, discountPoints: 0, reason: "No weather-related reduction in store visits is assumed." };
}
