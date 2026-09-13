import PersonalProductInfo from "@/app/components/PersonalProductInfo";
import BusinessGate from "@/app/components/BusinessGate";
import { notFound } from "next/navigation";
import { getAllFoodItems } from "@/app/lib/openFoodFacts";
import { calculatePricing } from "@/app/lib/pricingEngine";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const business = (await searchParams).mode === "business";

  const rawItems = await getAllFoodItems();
  const processedItems = rawItems.map(item => calculatePricing(item));
  const product = processedItems.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return business
    ? <BusinessGate><ProductDetailClient product={product} business /></BusinessGate>
    : <PersonalProductInfo product={product} />;
}
