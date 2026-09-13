"use client";

import Link from "next/link";
import { Cormorant } from "next/font/google";
import {
  Apple,
  Carrot,
  Milk,
  Beef,
  Croissant,
  Fish,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { ProcessedFoodItem } from "@/app/lib/pricingEngine";
import { FoodCategory } from "@/app/data/foodData";

const cormorant = Cormorant({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

interface FoodCardProps {
  item: ProcessedFoodItem;
  index: number;
  business?: boolean;
}

function CategoryIcon({ category }: { category: FoodCategory }) {
  const className = "h-10 w-10 text-[#536B50]";
  switch (category) {
    case "Fruits":
      return <Apple className={className} />;
    case "Vegetables":
      return <Carrot className={className} />;
    case "Dairy":
      return <Milk className={className} />;
    case "Meat":
      return <Beef className={className} />;
    case "Bakery":
      return <Croissant className={className} />;
    case "Seafood":
      return <Fish className={className} />;
    default:
      return <UtensilsCrossed className={className} />;
  }
}

function urgencyColor(level: string): string {
  switch (level) {
    case "low":
      return "text-[#2D7545]";
    case "medium":
      return "text-amber-600";
    case "high":
      return "text-orange-600";
    case "critical":
      return "text-red-600";
    default:
      return "text-slate-600";
  }
}

function urgencyBg(level: string): string {
  switch (level) {
    case "low":
      return "bg-[#2D7545]/10 text-[#203B2A] border-[#2D7545]/30";
    case "medium":
      return "bg-amber-500/10 text-amber-800 border-amber-500/30";
    case "high":
      return "bg-orange-500/10 text-orange-800 border-orange-500/30";
    case "critical":
      return "bg-red-500/10 text-red-700 border-red-500/30";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
}

function freshnessBarColor(score: number): string {
  if (score >= 80) return "bg-[#2D7545]";
  if (score >= 60) return "bg-[#BCD980]";
  if (score >= 40) return "bg-amber-400";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

export default function FoodCard({ item, index, business = false }: FoodCardProps) {
  const isCritical = item.urgencyLevel === "critical";

  return (
    <Link href={`/product/${item.id}${business ? "?mode=business" : ""}`} className="block">
      <div
        className={`food-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 transition-all duration-300 hover:border-[#2D7545] hover:-translate-y-1 ${
          isCritical ? "critical-pulse" : ""
        }`}
        style={{ animationDelay: `${index * 40}ms` }}
      >
        {/* Discount badge */}
        {item.discountPercentage > 0 && (
          <div
            className={business
              ? `absolute top-3 right-3 z-20 rounded-full border px-2.5 py-0.5 text-xs font-extrabold ${urgencyBg(item.urgencyLevel)} ${isCritical ? "animate-pulse" : ""}`
              : "absolute top-3 right-3 z-20 rounded-xl border-2 border-red-600 bg-white px-3 py-1.5 text-lg font-black text-red-600 shadow-sm"}
          >
            -{item.discountPercentage}%{business ? "" : " OFF"}
          </div>
        )}

        <div>
          {/* Media preview */}
          <div className="relative mb-3 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-2 group-hover:border-[#2D7545]/20 transition-colors">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            
            {item.brand && (
              <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#203B2A] border border-slate-200/80">
                {item.brand}
              </div>
            )}
          </div>

          {/* Title & category */}
          <div className="mb-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-block rounded-full bg-[#FAF9F5] border border-[#536B50]/30 px-2 py-0.5 text-[10px] font-bold text-[#203B2A]">
                {item.category}
              </span>
              {item.nutriscore && (
                <span className="flex items-center gap-1 rounded bg-[#2D7545]/10 text-[#203B2A] px-1.5 py-0.5 text-[10px] font-bold border border-[#2D7545]/30">
                  <ShieldCheck className="h-3 w-3 text-[#2D7545]" />
                  Nutri-Score {item.nutriscore}
                </span>
              )}
            </div>
            <h3 className={`truncate text-2xl font-medium tracking-tight text-[#203B2A] group-hover:text-[#2D7545] transition-colors ${cormorant.className}`}>
              {item.name}
            </h3>
          </div>
        </div>

        <div>
          {/* Freshness Bar */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-[#536B50] font-medium">Freshness Score</span>
              <span className={`font-bold ${urgencyColor(item.urgencyLevel)}`}>
                {item.freshnessScore}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
              <div
                className={`freshness-bar h-full rounded-full transition-all duration-700 ${freshnessBarColor(
                  item.freshnessScore
                )}`}
                style={{ width: `${Math.max(item.freshnessScore, 4)}%` }}
              />
            </div>
          </div>

          {/* Freshness Label & Days Remaining */}
          <div className="mb-4 flex items-center justify-between text-xs">
            <span
              className={`rounded-full border px-2 py-0.5 font-bold ${urgencyBg(
                item.urgencyLevel
              )}`}
            >
              {item.freshnessLabel}
            </span>
            <span className="text-slate-500 font-medium">
              {item.daysUntilExpiry < 0
                ? `Expired ${Math.abs(item.daysUntilExpiry)}d ago`
                : item.daysUntilExpiry === 0
                ? "Expires today"
                : `${item.daysUntilExpiry}d remaining`}
            </span>
          </div>

          {/* Pricing & Footer Link */}
          <div className="flex items-end justify-between border-t border-slate-100 pt-3">
            <div>
              {item.discountPercentage > 0 && (
                <span className="mr-2 text-xs text-slate-400 line-through">
                  ${item.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xl font-black font-medium text-[#203B2A]">
                ${item.discountedPrice.toFixed(2)}
              </span>
              <span className="ml-1 text-[11px] text-slate-500">/{item.unit}</span>
              {!business && item.discountPercentage > 0 && (
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-red-600">
                  Save <span className={`text-lg font-semibold normal-case tracking-normal ${cormorant.className}`}>
                    ${(item.originalPrice - item.discountedPrice).toFixed(2)}
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2D7545] group-hover:translate-x-1 transition-transform">
              <span>Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
