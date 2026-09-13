import { calculatePricing, ProcessedFoodItem } from "./pricingEngine";

export interface PriceRange { min: number; max: number }
const KEY = "smartpricetag_price_ranges";

export function readPriceRange(id: string): PriceRange | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const range = JSON.parse(localStorage.getItem(KEY) || "{}")[id];
    if (range && Number.isFinite(range.min) && Number.isFinite(range.max) && range.min >= 0 && range.max >= range.min) return range;
  } catch { /* Ignore invalid stored preferences. */ }
  return undefined;
}

export function savePriceRange(id: string, range: PriceRange) {
  let ranges = {};
  try { ranges = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { /* Start fresh. */ }
  localStorage.setItem(KEY, JSON.stringify({ ...ranges, [id]: range }));
}

export function applyPricePreference(item: ProcessedFoodItem): ProcessedFoodItem {
  return calculatePricing(item, readPriceRange(item.id));
}
