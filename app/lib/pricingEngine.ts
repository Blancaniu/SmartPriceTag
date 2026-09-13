// AI-powered pricing engine
// Calculates freshness scores and applies dynamic discount tiers

import { FoodItem, foodItems } from "@/app/data/foodData";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export type FreshnessLabel =
  | "Fresh"
  | "Good"
  | "Sell Soon"
  | "Clearance"
  | "Last Chance"
  | "Expired";

export interface ProcessedFoodItem extends FoodItem {
  freshnessScore: number; // 0–100
  freshnessLabel: FreshnessLabel;
  discountPercentage: number;
  discountedPrice: number;
  daysUntilExpiry: number;
  urgencyLevel: UrgencyLevel;
  totalShelfLifeDays: number;
}

/**
 * Core AI discount algorithm.
 *
 * 1. Compute total shelf life = expiryDate − stockDate (days).
 * 2. Compute remaining life  = expiryDate − today (days).
 * 3. Freshness score          = clamp(remaining / total * 100, 0, 100).
 * 4. Map score → discount tier.
 */
export function calculatePricing(item: FoodItem): ProcessedFoodItem {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stockDate = new Date(item.stockDate);
  stockDate.setHours(0, 0, 0, 0);

  const expiryDate = new Date(item.expiryDate);
  expiryDate.setHours(0, 0, 0, 0);

  const totalShelfLifeDays = Math.max(
    1,
    Math.round(
      (expiryDate.getTime() - stockDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const daysUntilExpiry = Math.round(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const rawScore = (daysUntilExpiry / totalShelfLifeDays) * 100;
  const freshnessScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // ── Discount tiers ──────────────────────────────────
  let discountPercentage: number;
  let freshnessLabel: FreshnessLabel;
  let urgencyLevel: UrgencyLevel;

  if (daysUntilExpiry < 0) {
    // Expired
    discountPercentage = 75;
    freshnessLabel = "Expired";
    urgencyLevel = "critical";
  } else if (freshnessScore >= 80) {
    discountPercentage = 0;
    freshnessLabel = "Fresh";
    urgencyLevel = "low";
  } else if (freshnessScore >= 60) {
    discountPercentage = 10;
    freshnessLabel = "Good";
    urgencyLevel = "low";
  } else if (freshnessScore >= 40) {
    discountPercentage = 25;
    freshnessLabel = "Sell Soon";
    urgencyLevel = "medium";
  } else if (freshnessScore >= 20) {
    discountPercentage = 40;
    freshnessLabel = "Clearance";
    urgencyLevel = "high";
  } else {
    discountPercentage = 60;
    freshnessLabel = "Last Chance";
    urgencyLevel = "critical";
  }

  const discountedPrice = parseFloat(
    (item.originalPrice * (1 - discountPercentage / 100)).toFixed(2)
  );

  return {
    ...item,
    freshnessScore,
    freshnessLabel,
    discountPercentage,
    discountedPrice,
    daysUntilExpiry,
    urgencyLevel,
    totalShelfLifeDays,
  };
}

/**
 * Process all food items through the pricing engine.
 */
export function getProcessedFoodItems(): ProcessedFoodItem[] {
  return foodItems.map(calculatePricing);
}
