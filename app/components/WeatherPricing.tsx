"use client";

import { useEffect, useRef, useState } from "react";
import { CloudSun, Users, TrendingDown, MapPin } from "lucide-react";
import StatsCard from "./StatsCard";
import type { WeatherDemand } from "@/app/lib/weatherDemand";

export default function WeatherPricing({ weather, editable = false }: { weather?: WeatherDemand; editable?: boolean }) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const locationRequest = useRef(0);
  const locationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    locationRequest.current++;
    if (locationTimer.current) clearTimeout(locationTimer.current);
  }, []);
  function useMyLocation() {
    if (locating) return;
    setLocationError("");
    if (!window.isSecureContext) {
      setLocationError("Open this site over HTTPS to use location. An HTTP network address (such as 192.168.x.x) will not work. Localhost works only on the computer running the app.");
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("This browser does not provide location access. Try Safari or Chrome in a normal browser window.");
      return;
    }
    const isMac = /Macintosh|MacIntel/.test(navigator.userAgent + navigator.platform);
    const help = isMac
      ? " On your Mac, enable Location Services for your browser in System Settings > Privacy & Security > Location Services. In Safari, also allow this site under Settings > Websites > Location."
      : " Allow location for this site in your browser settings and enable your device's Location Services.";
    const requestId = ++locationRequest.current;
    const finish = (error?: string) => {
      if (requestId !== locationRequest.current) return false;
      locationRequest.current++;
      if (locationTimer.current) clearTimeout(locationTimer.current);
      setLocating(false);
      if (error) setLocationError(error);
      return true;
    };
    setLocating(true);
    // Some browsers leave a permission prompt pending beyond the API timeout.
    locationTimer.current = setTimeout(() => finish("Location is taking too long. Check the browser permission prompt, then try again." + help), 45000);
    try {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (requestId !== locationRequest.current) return;
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
        finish("Your browser returned an invalid location. Please try again.");
        return;
      }
      const coordinates = `${coords.latitude.toFixed(3)},${coords.longitude.toFixed(3)}`;
      try {
      document.cookie = `store-weather-coordinates=${encodeURIComponent(coordinates)}; Path=/; Max-Age=86400; SameSite=Lax`;
      if (!document.cookie.split("; ").includes(`store-weather-coordinates=${encodeURIComponent(coordinates)}`)) {
        finish("Your browser blocked saving the location. Allow cookies for this site and try again.");
        return;
      }
      if (!finish()) return;
      window.location.reload();
      } catch {
        finish("Could not save your location. Allow cookies for this site and try again.");
      }
    }, error => {
      finish(error.code === 1
        ? "Location permission was denied." + help
        : error.code === 3 ? "Location request timed out. Please try again." + help
          : "Your location could not be determined. Check your network connection and try again." + help);
    }, { enableHighAccuracy: false, timeout: 30000, maximumAge: 300000 });
    } catch {
      finish("The browser could not start a location request." + help);
    }
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

  </section>;
}
