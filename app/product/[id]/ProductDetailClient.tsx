"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Tag,
  Info,
  SlidersHorizontal,
  CheckCircle2,
  UtensilsCrossed,
} from "lucide-react";
import PriceRangeSlider from "@/app/components/PriceRangeSlider";
import WeatherPricing from "@/app/components/WeatherPricing";
import { PriceRange, readPriceRange, savePriceRange } from "@/app/lib/pricePreferences";
import { calculatePricing, clampPrice, ProcessedFoodItem } from "@/app/lib/pricingEngine";

interface ProductDetailClientProps {
  product: ProcessedFoodItem;
  business?: boolean;
}

export default function ProductDetailClient({ product: initialProduct, business = false }: ProductDetailClientProps) {
  const [range, setRange] = useState<PriceRange | undefined>(() => readPriceRange(initialProduct.id));
  const [saveError, setSaveError] = useState("");
  const product = calculatePricing(initialProduct, range);
  const maxPrice = Math.round(product.originalPrice * 100) / 100;
  const activeRange = range || { min: 0, max: maxPrice };
  function updateRange(next: PriceRange) {
    try {
      savePriceRange(product.id, next);
      setRange(next);
      setSaveError("");
    } catch { setSaveError("Could not save your preference. Please enable browser storage and try again."); }
  }
  // Simulated future days offset for the AI Pricing Simulator
  const [simulatedDays, setSimulatedDays] = useState(0);

  const totalShelfLife = product.totalShelfLifeDays || 7;
  const currentDaysRemaining = product.daysUntilExpiry;
  const simulatedDaysRemaining = currentDaysRemaining - simulatedDays;

  const simulatedFreshnessRaw = (simulatedDaysRemaining / totalShelfLife) * 100;
  const simulatedFreshnessScore = Math.max(0, Math.min(100, Math.round(simulatedFreshnessRaw)));

  let simDiscount = 0;
  let simLabel = "Fresh";

  if (simulatedDaysRemaining < 0) {
    simDiscount = 75;
    simLabel = "Expired";
  } else if (simulatedFreshnessScore >= 80) {
    simDiscount = 0;
    simLabel = "Fresh";
  } else if (simulatedFreshnessScore >= 60) {
    simDiscount = 10;
    simLabel = "Good";
  } else if (simulatedFreshnessScore >= 40) {
    simDiscount = 25;
    simLabel = "Sell Soon";
  } else if (simulatedFreshnessScore >= 20) {
    simDiscount = 40;
    simLabel = "Clearance";
  } else {
    simDiscount = 60;
    simLabel = "Last Chance";
  }

  simDiscount = Math.min(75, simDiscount + (simulatedDaysRemaining >= 0 ? product.weatherDiscountPoints : 0));
  const simDiscountedPrice = clampPrice(product.originalPrice * (1 - simDiscount / 100), range);
  simDiscount = product.originalPrice > 0 ? Math.round((1 - simDiscountedPrice / product.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#203B2A]">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top bar / Back navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={business ? "/business" : "/"}
            className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#203B2A] transition-all hover:border-[#2D7545]"
          >
            <ArrowLeft className="h-4 w-4 text-[#2D7545] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-[#536B50]">
            <span className="font-semibold">Product ID:</span>
            <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[#203B2A] border border-slate-200">
              {product.id}
            </code>
          </div>
        </div>

        {/* Product Overview Header */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Product Image & Badges */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4">
              <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover rounded-xl transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <UtensilsCrossed className="h-20 w-20 text-[#536B50]" />
                )}

                {/* Discount Badge */}
                {product.discountPercentage > 0 && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-red-600 text-white px-3 py-1 text-xs font-black">
                    <Tag className="h-3.5 w-3.5" />
                    -{product.discountPercentage}% AI DISCOUNT
                  </div>
                )}
              </div>

              {/* Nutri-Score & Brand Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                {product.brand && (
                  <span className="rounded-lg bg-[#203B2A]/10 px-3 py-1 font-bold text-[#203B2A] border border-[#203B2A]/20">
                    Brand: {product.brand}
                  </span>
                )}
                {product.nutriscore && (
                  <span className="flex items-center gap-1 rounded-lg bg-[#2D7545]/10 px-3 py-1 font-extrabold text-[#203B2A] border border-[#2D7545]/30">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#2D7545]" />
                    Nutri-Score: {product.nutriscore}
                  </span>
                )}
                <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {product.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Pricing & Metadata Card */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-[#2D7545]/15 text-[#203B2A] border border-[#2D7545]/30 px-3 py-0.5 text-xs font-bold">
                  {product.category}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  GTIN / Barcode: <span className="font-mono text-slate-700">{product.barcode || "9312345678901"}</span>
                </span>
              </div>

              <h1 className="text-3xl font-black text-[#203B2A] mb-2">{product.name}</h1>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {product.description || "Fresh premium grocery item managed by F-freshie automated freshness tracking and dynamic markdown engine."}
              </p>

              {/* AI Pricing Card */}
              <div className="rounded-2xl border border-[#2D7545]/30 bg-gradient-to-br from-[#FAF9F5] via-white to-[#2D7545]/10 p-6">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-[#536B50]">
                      Smart AI Dynamic Price
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-4xl font-black text-[#203B2A]">
                        ${product.discountedPrice.toFixed(2)}
                      </span>
                      {product.discountPercentage > 0 && (
                        <span className="text-lg text-slate-400 line-through font-semibold">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 block">Total Customer Savings</span>
                    <span className="text-xl font-extrabold text-[#2D7545]">
                      ${(product.originalPrice - product.discountedPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Freshness Gauge */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                    <span className="text-[#536B50]">Freshness Score Gauge</span>
                    <span className="text-[#203B2A]">{product.freshnessScore}% ({product.freshnessLabel})</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-[#2D7545] transition-all duration-700"
                      style={{ width: `${Math.max(product.freshnessScore, 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata stat items */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="text-slate-500 block mb-1 font-semibold">Stocked Date</span>
                <span className="font-extrabold text-[#203B2A]">{product.stockDate}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="text-slate-500 block mb-1 font-semibold">Expiry Date</span>
                <span className="font-extrabold text-[#203B2A]">{product.expiryDate}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <span className="text-slate-500 block mb-1 font-semibold">Days Remaining</span>
                <span className={`font-black ${product.daysUntilExpiry <= 1 ? "text-red-600" : "text-[#2D7545]"}`}>
                  {product.daysUntilExpiry < 0 ? "Expired" : `${product.daysUntilExpiry} Days`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <WeatherPricing weather={product.weather} />
        {business && (
          <section className="mb-8 rounded-3xl border border-[#203B2A]/20 bg-white p-6">
            <h2 className="text-base font-extrabold">Price range preference</h2>
            <p className="mt-1 mb-4 text-xs text-[#536B50]">All AI prices, including future simulations, stay within this range. Saved in this browser.</p>
            <PriceRangeSlider value={activeRange} ceiling={maxPrice} onChange={updateRange} />
            <button type="button" onClick={() => updateRange({ min: 0, max: maxPrice })} className="mt-3 text-xs underline">Reset range</button>
            {saveError && <p role="alert" className="mt-2 text-sm text-red-600">{saveError}</p>}
          </section>
        )}
        {/* ── Interactive AI Future Price Simulator ── */}
        {business && <div className="mb-8 rounded-3xl border border-[#203B2A]/20 bg-white p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#203B2A] flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#2D7545]" />
                AI Future Price &amp; Freshness Simulator
              </h2>
              <p className="text-xs text-[#536B50]">
                Simulate time decay with today&apos;s weather adjustment held constant; this is not a weather forecast.
              </p>
            </div>

            <div className="rounded-full bg-[#203B2A] text-white px-3 py-1 text-xs font-bold self-start">
              Simulating +{simulatedDays} Day{simulatedDays !== 1 ? "s" : ""} in Future
            </div>
          </div>

          <div className="mb-6">
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={simulatedDays}
              onChange={(e) => setSimulatedDays(Number(e.target.value))}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-[#2D7545]"
              id="future-pricing-simulator-slider"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono font-semibold">
              <span>Today (0d)</span>
              <span>+2 Days</span>
              <span>+5 Days</span>
              <span>+8 Days</span>
              <span>+10 Days</span>
            </div>
          </div>

          {/* Simulation Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-[#536B50] block mb-1 font-semibold">Simulated Freshness</span>
              <span className="text-xl font-black text-[#203B2A]">{simulatedFreshnessScore}%</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-[#536B50] block mb-1 font-semibold">AI Status Tier</span>
              <span className="text-xl font-black text-amber-800">{simLabel}</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-[#536B50] block mb-1 font-semibold">Auto Discount</span>
              <span className="text-xl font-black text-red-600">-{simDiscount}%</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs text-[#536B50] block mb-1 font-semibold">Predicted Shelf Price</span>
              <span className="text-2xl font-black text-[#2D7545]">${simDiscountedPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        }
        {/* ── Ingredients & Electronic Shelf Tag Preview ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Ingredients & Storage Specs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6">
              <h3 className="text-sm font-extrabold text-[#203B2A] mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2D7545]" />
                Ingredients &amp; Verification
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-medium">
                {product.ingredients || "100% natural, ethically sourced ingredients. Verified via Open Food Facts standard database."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6">
              <h3 className="text-sm font-extrabold text-[#203B2A] mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-[#2D7545]" />
                Storage &amp; Dynamic POS Guidelines
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-medium">
                <li>Store in cool, dry place or refrigerate below 4°C as specified.</li>
                <li>Dynamic discount applies automatically at digital POS checkout terminals.</li>
                <li>Best quality recommended before expiry date ({product.expiryDate}).</li>
              </ul>
            </div>
          </div>

          {/* Electronic Shelf Label (ESL) Simulation Box */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border-2 border-[#203B2A] bg-white p-5 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#536B50]">
                  ELECTRONIC SHELF TAG #ESL-892
                </span>
                <span className="flex items-center gap-1 rounded bg-[#2D7545] text-white px-2 py-0.5 text-[9px] font-bold">
                  <CheckCircle2 className="h-3 w-3" />
                  POS SYNCED
                </span>
              </div>

              <div className="mb-2">
                <span className="text-[11px] font-bold text-[#536B50] uppercase">{product.brand || "Fresh Grocery"}</span>
                <h4 className="text-lg font-black leading-tight text-[#203B2A]">{product.name}</h4>
              </div>

              <div className="my-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">SMART PRICE ({product.unit})</span>
                  <span className="text-3xl font-black text-[#203B2A]">${product.discountedPrice.toFixed(2)}</span>
                </div>
                {product.discountPercentage > 0 && (
                  <div className="text-right">
                    <span className="rounded bg-[#203B2A] text-white px-2 py-0.5 text-xs font-bold block mb-1">
                      SAVE {product.discountPercentage}%
                    </span>
                    <span className="text-xs text-slate-400 line-through font-semibold">${product.originalPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#536B50] font-mono font-bold">
                <span>BARCODE: {product.barcode || "9312345678901"}</span>
                <span>FRESHNESS: {product.freshnessScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
