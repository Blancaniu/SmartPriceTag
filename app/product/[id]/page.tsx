import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllFoodItems } from "@/app/lib/openFoodFacts";
import { calculatePricing } from "@/app/lib/pricingEngine";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const rawItems = await getAllFoodItems();
  const processedItems = rawItems.map(calculatePricing);
  const product = processedItems.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
