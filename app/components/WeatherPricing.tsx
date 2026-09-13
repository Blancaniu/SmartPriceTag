"use client";

import { useState } from "react";
import { CloudSun, Users, TrendingDown, MapPin } from "lucide-react";
import StatsCard from "./StatsCard";
import type { WeatherDemand } from "@/app/lib/weatherDemand";

export default function WeatherPricing({ weather, editable = false }: { weather?: WeatherDemand; editable?: boolean }) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  function useMyLocation() {
    setLocationError("");
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationError("Location requires HTTPS or localhost and a supported browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const coordinates = `${coords.latitude.toFixed(3)},${coords.longitude.toFixed(3)}`;
      document.cookie = `store-weather-coordinates=${encodeURIComponent(coordinates)}; Path=/; Max-Age=86400; SameSite=Lax`;
      window.location.reload();
    }, error => {
      setLocating(false);
      setLocationError(error.code === 1
        ? "Location permission was denied. Allow it in your browser settings and try again."
        : error.code === 3 ? "Location request timed out. Please try again."
          : "Your location could not be determined. Please try again.");
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }
  const available = weather?.status === "available";
  const traffic = available ? { normal: "Normal", reduced: "Reduced", low: "Low", unknown: "Unknown" }[weather.traffic] : "Unavailable";
  return <section aria-label="Weather and estimated store visits" className="my-4 text-sm text-[#203B2A]">
    <div className="mb-4 flex flex-col items-end gap-2 text-right">
      <div className="min-w-0 sm:max-w-xl sm:text-right">
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-[#536B50] sm:justify-end"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />{weather?.location || "Choose a store location"}{available && <span className="capitalize"> · {weather.summary}</span>}</p>
        {!available && <p className="mt-2 text-xs text-slate-500">{weather?.reason || "Weather has not loaded. Freshness pricing applies."}</p>}
      </div>
    {editable && <div className="flex shrink-0 flex-col items-end gap-1 text-right">
      <button type="button" onClick={useMyLocation} disabled={locating} className="inline-flex items-center gap-2 rounded-lg bg-[#203B2A] px-3 py-2 font-bold text-white hover:bg-[#2D7545] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#203B2A] disabled:cursor-wait disabled:opacity-60"><MapPin aria-hidden="true" className="h-4 w-4" />{locating ? "Finding your location..." : "Use my location"}</button>
      <p className="text-xs text-slate-500">Use your current location for weather pricing.</p>
      {locationError && <p role="alert" className="max-w-sm text-xs text-red-600">{locationError}</p>}
    </div>}
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard icon={CloudSun} label="Current weather" value={available ? `${Math.round(weather.temperatureC!)}°C` : "Unavailable"} accentBg="bg-[#203B2A]/10" iconColor="text-[#203B2A]" />
      <StatsCard icon={Users} label="Estimated store visits" value={traffic} accentBg="bg-[#2D7545]/15" iconColor="text-[#2D7545]" delay={50} />
      <StatsCard icon={TrendingDown} label="Weather discount" value={`+${available ? weather.discountPoints : 0} pts`} accentBg="bg-[#BCD980]/20" iconColor="text-[#203B2A]" delay={100} />
    </div>
    {available && <p className="mt-3 px-1 text-right text-xs text-[#536B50]">OpenWeather · Adjustment before price limits</p>}

  </section>;
}
