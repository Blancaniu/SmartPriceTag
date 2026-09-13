"use client";

import { useState } from "react";
import { PriceRange } from "@/app/lib/pricePreferences";

interface Props {
  value: PriceRange;
  ceiling: number;
  onChange: (range: PriceRange) => void;
}

export default function PriceRangeSlider({ value, ceiling, onChange }: Props) {
  const [editing, setEditing] = useState<"min" | "max" | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const lowerPercent = ceiling > 0 ? value.min / ceiling * 100 : 0;
  const upperPercent = ceiling > 0 ? value.max / ceiling * 100 : 0;

  function commit(endpoint: "min" | "max") {
    const amount = Number(draft);
    if (!draft.trim() || !Number.isFinite(amount) || amount < 0 || amount > ceiling ||
        (endpoint === "min" ? amount > value.max : amount < value.min)) {
      setError(`Enter a ${endpoint === "min" ? "minimum" : "maximum"} price between $${(endpoint === "min" ? 0 : value.min).toFixed(2)} and $${(endpoint === "min" ? value.max : ceiling).toFixed(2)}.`);
      return;
    }
    onChange({ ...value, [endpoint]: Math.round(amount * 100) / 100 });
    setEditing(null);
    setError("");
  }

  return (
    <div>
      <div className="mb-3 flex justify-between gap-4">
        {(["min", "max"] as const).map(endpoint => (
          <div key={endpoint} className={endpoint === "max" ? "text-right" : ""}>
            <span className="mb-1 block text-xs text-[#53863D]">{endpoint === "min" ? "Minimum price" : "Maximum price"}</span>
            {editing === endpoint ? (
              <input autoFocus type="number" step="0.01" min={endpoint === "min" ? 0 : value.min}
                max={endpoint === "min" ? value.max : ceiling} value={draft}
                aria-label={`Edit ${endpoint === "min" ? "minimum" : "maximum"} price`}
                onChange={event => setDraft(event.target.value)}
                onBlur={() => commit(endpoint)}
                onKeyDown={event => {
                  if (event.key === "Enter") { event.preventDefault(); commit(endpoint); }
                  if (event.key === "Escape") { setEditing(null); setError(""); }
                }}
                className="w-28 rounded-lg border border-[#3C9F47] bg-white px-2 py-1 text-sm font-bold outline-none" />
            ) : (
              <button type="button" aria-label={`Edit ${endpoint === "min" ? "minimum" : "maximum"} price`}
                onClick={() => { setEditing(endpoint); setDraft(value[endpoint].toFixed(2)); setError(""); }}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-bold hover:border-[#3C9F47]">
                ${value[endpoint].toFixed(2)}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="price-range-slider relative h-8">
        <div className="absolute inset-x-0 top-3 h-2 rounded-full bg-slate-100">
          <div className="absolute h-full rounded-full bg-[#3C9F47]" style={{ left: `${lowerPercent}%`, width: `${upperPercent - lowerPercent}%` }} />
        </div>
        <input type="range" aria-label="Minimum price" min={0} max={ceiling} step={0.01} value={value.min}
          disabled={ceiling === 0} style={{ zIndex: lowerPercent > 90 ? 3 : 1 }}
          onChange={event => onChange({ ...value, min: Math.min(Number(event.target.value), value.max) })} />
        <input type="range" aria-label="Maximum price" min={0} max={ceiling} step={0.01} value={value.max}
          disabled={ceiling === 0} style={{ zIndex: 2 }}
          onChange={event => onChange({ ...value, max: Math.max(Number(event.target.value), value.min) })} />
      </div>
      <p className="mt-1 text-xs text-[#53863D]">Drag either handle or click a price to enter a number.</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
