import { NextResponse } from "next/server";
import { getAllFoodItems } from "@/app/lib/openFoodFacts";
import { calculatePricing } from "@/app/lib/pricingEngine";

export async function GET() {
  try {
    const rawItems = await getAllFoodItems();
    const processedItems = rawItems.map(calculatePricing);
    return NextResponse.json({ success: true, items: processedItems });
  } catch (error) {
    console.error("Failed to fetch products route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
