import { estimateWeatherDemand, type WeatherDemand } from "./weatherDemand";
import { cookies } from "next/headers";

export async function getWeatherDemand(): Promise<WeatherDemand> {
  const cookieStore = await cookies();
  const storedLocation = cookieStore.get("store-weather-location")?.value;
  let coordinates: { lat: number; lon: number } | undefined;
  try {
    const raw = decodeURIComponent(cookieStore.get("store-weather-coordinates")?.value || "");
    if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(raw)) {
      const [lat, lon] = raw.split(",").map(Number);
      if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) coordinates = { lat, lon };
    }
  } catch { /* Ignore invalid coordinates and use the manual location. */ }
  let location = process.env.OPENWEATHER_LOCATION || "";
  try {
    if (storedLocation) location = decodeURIComponent(storedLocation);
  } catch { /* Use the default for malformed cookies. */ }
  location = location.trim().slice(0, 120);
  if (coordinates) location = "Current location";
  const key = process.env.OPENWEATHER_API_KEY?.trim();
  const unavailable = (reason: string): WeatherDemand => ({ status: "unavailable", location, summary: "Weather unavailable", traffic: "unknown", discountPoints: 0, reason });
  if (!key || !location) return unavailable("Weather pricing is not configured. Freshness pricing applies.");
  try {
    let place = coordinates;
    if (!place) {
    const geoUrl = new URL("https://api.openweathermap.org/geo/1.0/direct");
    geoUrl.search = new URLSearchParams({ q: location, limit: "1", appid: key }).toString();
    const geoResponse = await fetch(geoUrl, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) });
    if (!geoResponse.ok) return unavailable("Weather location lookup failed. Freshness pricing applies.");
    const places = await geoResponse.json();
    place = places?.[0];
    if (!Number.isFinite(place?.lat) || !Number.isFinite(place?.lon)) return unavailable("Store location was not found. Freshness pricing applies.");
    }
    if (!place) return unavailable("Store location was not found. Freshness pricing applies.");
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.search = new URLSearchParams({ lat: String(place.lat), lon: String(place.lon), appid: key, units: "metric" }).toString();
    const response = await fetch(url, { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return unavailable("Weather service is unavailable. Freshness pricing applies.");
    const data = await response.json();
    if (coordinates && typeof data.name === "string" && data.name.trim()) location = data.name;
    const code = data.weather?.[0]?.id;
    const temperature = data.main?.temp;
    const wind = data.wind?.speed;
    const rain = data.rain?.["1h"] ?? 0;
    if (![code, temperature, wind, rain, data.dt].every(Number.isFinite)
      || Date.now() / 1000 - data.dt > 7200 || data.dt > Date.now() / 1000 + 600) {
      return unavailable("Weather readings are missing or outdated. Freshness pricing applies.");
    }
    return { status: "available", location, summary: String(data.weather[0].description || "Current weather"),
      temperatureC: temperature, observedAt: new Date(data.dt * 1000).toISOString(),
      ...estimateWeatherDemand(code, temperature, wind, rain) };
  } catch {
    return unavailable("Could not retrieve current weather. Freshness pricing applies.");
  }
}
