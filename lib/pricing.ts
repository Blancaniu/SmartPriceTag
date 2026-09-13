import type { FreshnessState, PricingSettings, Product } from "@/types";

const DAY = 86_400_000;

function daysUntil(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const expiry = Date.UTC(year, month - 1, day);
  return Math.round((expiry - today) / DAY);
}

function temperaturePenalty(product: Product) {
  const temperature = product.sensor?.temperatureC;
  if (temperature === undefined) return 0;
  if (product.storageType === "frozen") return temperature > -12 ? 24 : 0;
  if (product.storageType === "chilled") return temperature > 8 ? 20 : temperature > 5 ? 8 : 0;
  return temperature > 30 ? 8 : 0;
}

export function priceProduct(product: Product, settings: PricingSettings): Product {
  const days = daysUntil(product.expiryDate);
  let risk = temperaturePenalty(product);
  const reasons: string[] = [];

  if (days < 0) {
    return {
      ...product,
      currentPrice: 0,
      discountPercent: 100,
      freshnessScore: 0,
      state: "unsafe",
      explanation: ["The entered expiry date has passed. Remove this item from sale."],
    };
  }

  if (days === 0) {
    risk += 55;
    reasons.push("expires today");
  } else if (days <= 2) {
    risk += 42;
    reasons.push(`${days} day${days === 1 ? "" : "s"} remaining`);
  } else if (days <= 5) {
    risk += 26;
    reasons.push(`${days} days remaining`);
  } else if (days <= 10) {
    risk += 10;
  }

  if (product.sensor?.visualFreshness !== undefined) {
    risk += Math.max(0, 100 - product.sensor.visualFreshness) * 0.25;
    if (product.sensor.visualFreshness < 65) reasons.push("low visual freshness reading");
  }
  if ((product.sensor?.gasPpm ?? 0) > 450) {
    risk += 18;
    reasons.push("elevated optional gas reading");
  }
  const tempRisk = temperaturePenalty(product);
  if (tempRisk > 0) reasons.push("storage temperature outside the preferred range");
  if (settings.demandLevel === "low") risk += 8;
  if (settings.footTraffic === "low") risk += 5;
  if (settings.weatherRisk) risk += 4;

  const discount = Math.min(settings.maximumDiscount, Math.max(0, Math.round(risk / 5) * 5));
  const freshnessScore = Math.max(5, Math.round(100 - risk));
  let state: FreshnessState = "fresh";
  if (freshnessScore < 35) state = "urgent";
  else if (freshnessScore < 70) state = "use-soon";

  return {
    ...product,
    discountPercent: discount,
    currentPrice: Number((product.originalPrice * (1 - discount / 100)).toFixed(2)),
    freshnessScore,
    state,
    explanation: reasons.length ? reasons : ["expiry and storage readings are within the preferred range"],
  };
}
