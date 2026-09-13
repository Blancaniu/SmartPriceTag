import { NextResponse } from "next/server";
import { getAllFoodItems } from "@/app/lib/openFoodFacts";
import { calculatePricing } from "@/app/lib/pricingEngine";
import { getWeatherDemand } from "@/app/lib/openWeather";

export async function GET() {
  try {
    const [rawItems, weather] = await Promise.all([getAllFoodItems(), getWeatherDemand()]);
    const processedItems = rawItems.map(item => calculatePricing(item, undefined, weather));
    return NextResponse.json({ success: true, items: processedItems, weather });
  } catch (error) {
    console.error("Failed to fetch products route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
