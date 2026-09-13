import { priceProduct } from "@/lib/pricing";
import type { PricingSettings, Product, SensorReading } from "@/types";

const dateAfter = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

let settings: PricingSettings = {
  maximumDiscount: 60,
  updateIntervalSeconds: 10,
  demandLevel: "normal",
  footTraffic: "normal",
  weatherRisk: false,
};

let products: Product[] = [
  {
    id: "berry-yoghurt",
    barcode: "9300633885189",
    sensorDeviceId: "fridge-01",
    name: "Berry Yoghurt",
    category: "Chilled dairy",
    originalPrice: 6.5,
    currentPrice: 6.5,
    discountPercent: 0,
    expiryDate: dateAfter(2),
    stock: 8,
    storageType: "chilled",
    ingredients: ["Milk", "Berries", "Sugar"],
    allergens: ["Milk"],
    freshnessScore: 100,
    state: "fresh",
    explanation: [],
    sensor: {
      deviceId: "fridge-01",
      temperatureC: 4.1,
      humidityPercent: 54,
      recordedAt: new Date().toISOString(),
    },
  },
  {
    id: "garden-salad",
    sensorDeviceId: "produce-01",
    name: "Garden Salad Bowl",
    category: "Fresh produce",
    originalPrice: 9.9,
    currentPrice: 9.9,
    discountPercent: 0,
    expiryDate: dateAfter(1),
    stock: 5,
    storageType: "chilled",
    ingredients: ["Lettuce", "Tomato", "Carrot", "Cucumber"],
    allergens: [],
    freshnessScore: 100,
    state: "fresh",
    explanation: [],
    sensor: {
      deviceId: "produce-01",
      temperatureC: 5.8,
      humidityPercent: 68,
      visualFreshness: 74,
      recordedAt: new Date().toISOString(),
    },
  },
  {
    id: "sourdough",
    sensorDeviceId: "bakery-01",
    name: "Sourdough Loaf",
    category: "Bakery",
    originalPrice: 7.2,
    currentPrice: 7.2,
    discountPercent: 0,
    expiryDate: dateAfter(5),
    stock: 12,
    storageType: "ambient",
    ingredients: ["Wheat flour", "Water", "Salt"],
    allergens: ["Wheat / gluten"],
    freshnessScore: 100,
    state: "fresh",
    explanation: [],
  },
];

export function getProducts() {
  return products.map((product) => priceProduct(product, settings));
}

export function addProduct(input: Omit<Product, "id" | "currentPrice" | "discountPercent" | "freshnessScore" | "state" | "explanation">) {
  const product: Product = {
    ...input,
    id: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    currentPrice: input.originalPrice,
    discountPercent: 0,
    freshnessScore: 100,
    state: "fresh",
    explanation: [],
  };
  products = [product, ...products];
  return priceProduct(product, settings);
}

export function attachReading(reading: SensorReading) {
  const index = products.findIndex((product) => product.sensorDeviceId === reading.deviceId);
  if (index < 0) return undefined;
  products[index] = { ...products[index], sensor: reading };
  return priceProduct(products[index], settings);
}

export function getSettings() {
  return settings;
}

export function updateSettings(update: Partial<PricingSettings>) {
  settings = { ...settings, ...update };
  return settings;
}
