import PersonalProductInfo from "@/app/components/PersonalProductInfo";
import BusinessGate from "@/app/components/BusinessGate";
import { notFound } from "next/navigation";
import { getAllFoodItems } from "@/app/lib/openFoodFacts";
import { calculatePricing } from "@/app/lib/pricingEngine";
import { getWeatherDemand } from "@/app/lib/openWeather";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const business = (await searchParams).mode === "business";

  const [rawItems, weather] = await Promise.all([getAllFoodItems(), getWeatherDemand()]);
  const processedItems = rawItems.map(item => calculatePricing(item, undefined, weather));
  const product = processedItems.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return business
    ? <BusinessGate><ProductDetailClient product={product} business /></BusinessGate>
    : <PersonalProductInfo product={product} />;
}
