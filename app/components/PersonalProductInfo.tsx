"use client";

import { useState, useSyncExternalStore } from "react";
import { Cormorant } from "next/font/google";
import Link from "next/link";
import { ArrowLeft, FileText, Info, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { readPriceRange } from "@/app/lib/pricePreferences";
import { calculatePricing, ProcessedFoodItem } from "@/app/lib/pricingEngine";
import WeatherPricing from "./WeatherPricing";

const cormorant = Cormorant({ weight: ["400", "600", "700"], subsets: ["latin"] });

function subscribeToPreferences(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function PersonalProductInfo({ product: initialProduct }: { product: ProcessedFoodItem }) {
  const storedRange = useSyncExternalStore(
    subscribeToPreferences,
    () => JSON.stringify(readPriceRange(initialProduct.id)) || "",
    () => "",
  );
  const product = calculatePricing(initialProduct, storedRange ? JSON.parse(storedRange) : undefined);
  const savings = product.originalPrice - product.discountedPrice;
  const [advice, setAdvice] = useState("");
  const [adviceNotice, setAdviceNotice] = useState("");
  const [adviceError, setAdviceError] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  async function requestAdvice() {
    if (loadingAdvice) return;
    setLoadingAdvice(true);
    setAdviceError("");
    setAdviceNotice("");
    try {
      const response = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
        signal: AbortSignal.timeout(45000),
      });
      const data = await response.json();
      if (!response.ok || typeof data.advice !== "string" || !data.advice.trim()) {
        throw new Error(data.error || "Could not load advice. Please try again.");
      }
      setAdvice(data.advice);
      setAdviceNotice(data.warning || (data.demoMode ? "AI advice is not configured. Standard guidance is shown." : ""));
    } catch {
      setAdviceError("Could not load further advice. Please try again.");
    } finally {
      setLoadingAdvice(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F5] text-[#203B2A]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold hover:border-[#2D7545]">
          <ArrowLeft className="h-4 w-4" />Back to products
        </Link>
        <section className="mb-6 grid gap-6 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 md:grid-cols-2">
          <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 sm:h-96">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
            ) : <UtensilsCrossed className="h-20 w-20 text-[#536B50]" />}
            {product.discountPercentage > 0 && (
              <span className="absolute right-3 top-3 rounded-xl border-2 border-red-600 bg-white px-4 py-2 text-2xl font-black text-red-600 shadow-sm">
                -{product.discountPercentage}% OFF
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full border border-[#536B50]/30 bg-[#FAF9F5] px-3 py-1">{product.category}</span>
              {product.nutriscore && <span className="inline-flex items-center gap-1 rounded-lg border border-[#2D7545]/30 bg-[#2D7545]/10 px-2 py-1"><ShieldCheck className="h-4 w-4" />Nutri-Score {product.nutriscore}</span>}
            </div>
            <h1 className="mb-2 text-3xl font-black">{product.name}</h1>
            {product.brand && <p className="mb-4 text-sm font-semibold text-[#536B50]">{product.brand}</p>}
            <div className="mb-5">
              {product.discountPercentage > 0 && <p className="text-base text-slate-400 line-through">${product.originalPrice.toFixed(2)}</p>}
              <p><span className="text-4xl font-black">${product.discountedPrice.toFixed(2)}</span><span className="ml-1 text-sm text-slate-500">/{product.unit}</span></p>
              {product.discountPercentage > 0 && <p className="mt-1 text-sm font-bold uppercase tracking-wide text-red-600">Save <span className={`text-3xl font-semibold normal-case tracking-normal ${cormorant.className}`}>${savings.toFixed(2)}</span></p>}
            </div>
            <div className="border-t border-slate-100 pt-4">
              <div className="mb-2 flex justify-between text-sm font-bold"><span className="text-[#536B50]">Freshness Score</span><span>{product.freshnessScore}%</span></div>
              <div className="mb-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${product.freshnessScore >= 60 ? "bg-[#2D7545]" : product.freshnessScore >= 40 ? "bg-amber-400" : product.freshnessScore >= 20 ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${product.freshnessScore}%` }} /></div>
              <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-bold">{product.freshnessLabel}</span><span className="text-slate-500">{product.daysUntilExpiry < 0 ? `Expired ${Math.abs(product.daysUntilExpiry)}d ago` : product.daysUntilExpiry === 0 ? "Expires today" : `${product.daysUntilExpiry}d remaining`}</span></div>
            </div>
          </div>
        </section>
        <WeatherPricing weather={product.weather} />
        <section className="mb-4 rounded-2xl border border-slate-200/90 bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold"><FileText className="h-4 w-4 text-[#2D7545]" />Ingredients</h2>
          <p className="text-sm leading-relaxed text-slate-600">{product.ingredients || "Ingredients are not available. Check the product packaging for the full list."}</p>
        </section>
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold"><Info className="h-4 w-4 text-[#2D7545]" />If you buy now…</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>Follow the storage instructions on the packaging, including any refrigeration requirements.</li>
            <li>Check the date label on the packaging before buying and plan when you will use it.</li>
            <li>After opening, follow the package instructions for storage and how soon to use the product.</li>
          </ul>
          <button type="button" onClick={requestAdvice} disabled={loadingAdvice} aria-controls="further-advice" className="mt-5 rounded-xl bg-[#203B2A] px-4 py-2 text-sm font-bold text-white hover:bg-[#2D7545] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#203B2A] disabled:cursor-wait disabled:opacity-60">{loadingAdvice ? "Getting advice…" : advice ? "Refresh advice" : "Further advice"}</button>
          <div id="further-advice" aria-live="polite" aria-busy={loadingAdvice}>
            {advice && <div className="mt-4 rounded-xl border border-[#536B50]/20 bg-[#FAF9F5] p-4"><h3 className="mb-2 text-sm font-bold">Advice for {product.name}</h3>{adviceNotice && <p className="mb-2 text-xs text-amber-800">{adviceNotice}</p>}<p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{advice}</p></div>}
          </div>
          {adviceError && <p role="alert" className="mt-3 text-sm text-red-600">{adviceError}</p>}
        </section>
      </div>
    </main>
  );
}
