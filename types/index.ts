export type StorageType = "ambient" | "chilled" | "frozen";
export type FreshnessState = "fresh" | "use-soon" | "urgent" | "unsafe";

export interface SensorReading {
  deviceId: string;
  temperatureC: number;
  humidityPercent: number;
  gasPpm?: number;
  visualFreshness?: number;
  recordedAt: string;
}

export interface Product {
  id: string;
  barcode?: string;
  sensorDeviceId: string;
  name: string;
  category: string;
  originalPrice: number;
  currentPrice: number;
  discountPercent: number;
  expiryDate: string;
  stock: number;
  storageType: StorageType;
  ingredients: string[];
  allergens: string[];
  imageUrl?: string;
  sensor?: SensorReading;
  freshnessScore: number;
  state: FreshnessState;
  explanation: string[];
}

export interface PricingSettings {
  maximumDiscount: number;
  updateIntervalSeconds: number;
  demandLevel: "low" | "normal" | "high";
  footTraffic: "low" | "normal" | "high";
  weatherRisk: boolean;
}
