"use client";

import {
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Flame,
  AlertCircle,
  Sparkles,
  Globe,
  ArrowUpDown,
} from "lucide-react";

export type FilterMode = "below" | "above";
export type SortOrder = "freshest" | "least-fresh";

interface FreshnessSliderProps {
  personal?: boolean;
  freshnessValue: number;
  onChangeFreshness: (val: number) => void;
  filterMode: FilterMode;
  onChangeFilterMode: (mode: FilterMode) => void;
  sortOrder: SortOrder;
  onChangeSortOrder: (sort: SortOrder) => void;
  matchingCount: number;
  totalCount: number;
}

export default function FreshnessSlider({
  personal = false,
  freshnessValue,
  onChangeFreshness,
  filterMode,
  onChangeFilterMode,
  sortOrder,
  onChangeSortOrder,
  matchingCount,
  totalCount,
}: FreshnessSliderProps) {
  const getBadgeStyle = (val: number) => {
    if (val >= 80) return "text-[#304721] border-[#3C9F47] bg-[#3C9F47]/15";
    if (val >= 60) return "text-[#304721] border-[#6BB744] bg-[#6BB744]/15";
    if (val >= 40) return "text-amber-800 border-amber-400 bg-amber-500/15";
    if (val >= 20) return "text-orange-800 border-orange-400 bg-orange-500/15";
    return "text-red-700 border-red-400 bg-red-500/15";
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-5 transition-all duration-300">
      {/* Header controls & mode toggle */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3C9F47]/10 text-[#3C9F47] border border-[#3C9F47]/20">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#304721]">
              {personal ? "Freshness filter" : "Retail AI Freshness Filter & Slider"}
            </h3>
            <p className="text-xs text-[#53863D]">
              {personal ? "Find products that match your preferred freshness." : "Filter inventory by freshness threshold to manage dynamic pricing & waste"}
            </p>
          </div>
        </div>

        {/* Filter Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => onChangeFilterMode("below")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              filterMode === "below"
                ? "bg-[#304721] text-white"
                : "text-slate-600 hover:text-[#304721]"
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            Show ≤ {freshnessValue}% (Expiring)
          </button>
          <button
            onClick={() => onChangeFilterMode("above")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              filterMode === "above"
                ? "bg-[#3C9F47] text-white"
                : "text-slate-600 hover:text-[#304721]"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Show ≥ {freshnessValue}% (Fresh)
          </button>
        </div>
      </div>

      {/* Main Slider Track */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            0% (Least Fresh / Expired)
          </span>
          <span className={`rounded-full border px-3 py-0.5 text-sm font-black ${getBadgeStyle(freshnessValue)}`}>
            {filterMode === "below" ? `≤ ${freshnessValue}% Freshness` : `≥ ${freshnessValue}% Freshness`}
          </span>
          <span className="flex items-center gap-1.5 text-[#53863D] font-semibold">
            100% (Peak Fresh)
            <span className="h-2 w-2 rounded-full bg-[#3C9F47]" />
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={freshnessValue}
            onChange={(e) => onChangeFreshness(Number(e.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-[#3C9F47]"
            id="freshness-range-slider"
          />
        </div>
      </div>

      {/* Presets & Sort Order Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-[#53863D]">Quick Presets:</span>
          <button
            onClick={() => {
              onChangeFilterMode("below");
              onChangeFreshness(39);
            }}
            className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 transition-all"
          >
            <Flame className="h-3 w-3 text-red-600" />
            Clearance (≤39%)
          </button>
          <button
            onClick={() => {
              onChangeFilterMode("below");
              onChangeFreshness(60);
            }}
            className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition-all"
          >
            <AlertCircle className="h-3 w-3 text-amber-600" />
            Sell Soon (≤60%)
          </button>
          <button
            onClick={() => {
              onChangeFilterMode("above");
              onChangeFreshness(80);
            }}
            className="flex items-center gap-1 rounded-full border border-[#3C9F47]/30 bg-[#3C9F47]/10 px-2.5 py-1 text-[11px] font-bold text-[#304721] hover:bg-[#3C9F47]/20 transition-all"
          >
            <Sparkles className="h-3 w-3 text-[#3C9F47]" />
            Peak Fresh (≥80%)
          </button>
          <button
            onClick={() => {
              onChangeFilterMode("above");
              onChangeFreshness(0);
            }}
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition-all"
          >
            <Globe className="h-3 w-3 text-slate-500" />
            All (0–100%)
          </button>
        </div>

        {/* Sort Order Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#53863D]">Sort:</span>
          <button
            onClick={() =>
              onChangeSortOrder(sortOrder === "freshest" ? "least-fresh" : "freshest")
            }
            className="flex items-center gap-1.5 rounded-lg border border-[#304721]/20 bg-[#304721]/5 px-3 py-1.5 text-xs font-bold text-[#304721] hover:bg-[#304721]/10 transition-all"
            id="sort-direction-button"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-[#3C9F47]" />
            <span>{sortOrder === "freshest" ? "Freshest First" : "Least Fresh First"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
