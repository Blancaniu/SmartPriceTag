"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  Image as ImageIcon,
  Tag,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { FoodCategory, CATEGORIES } from "@/app/data/foodData";
import BusinessGate from "@/app/components/BusinessGate";
import { saveProduct } from "@/app/lib/supabaseClient";

function CreateProductPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<FoodCategory>("Fruits");
  const [brand, setBrand] = useState("");
  const [originalPrice, setOriginalPrice] = useState<string>("5.99");
  const [unit, setUnit] = useState("pack");
  
  // Date defaults: stock today, expiry +5 days
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 5);
  const expiryStr = defaultExpiry.toISOString().split("T")[0];

  const [stockDate, setStockDate] = useState(todayStr);
  const [expiryDate, setExpiryDate] = useState(expiryStr);
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [nutriscore, setNutriscore] = useState("A");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Real-time AI Pricing Calculations ──────────────
  const aiPricingPreview = useMemo(() => {
    const priceNum = parseFloat(originalPrice) || 0;
    const stock = new Date(stockDate);
    const expiry = new Date(expiryDate);
    const today = new Date();

    stock.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const totalShelfDays = Math.max(
      1,
      Math.round((expiry.getTime() - stock.getTime()) / (1000 * 60 * 60 * 24))
    );
    const daysRemaining = Math.round(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const rawScore = (daysRemaining / totalShelfDays) * 100;
    const freshnessScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    let discount = 0;
    let label = "Fresh";

    if (daysRemaining < 0) {
      discount = 75;
      label = "Expired";
    } else if (freshnessScore >= 80) {
      discount = 0;
      label = "Fresh";
    } else if (freshnessScore >= 60) {
      discount = 10;
      label = "Good";
    } else if (freshnessScore >= 40) {
      discount = 25;
      label = "Sell Soon";
    } else if (freshnessScore >= 20) {
      discount = 40;
      label = "Clearance";
    } else {
      discount = 60;
      label = "Last Chance";
    }

    const discountedPrice = parseFloat((priceNum * (1 - discount / 100)).toFixed(2));

    return {
      totalShelfDays,
      daysRemaining,
      freshnessScore,
      discount,
      label,
      discountedPrice,
    };
  }, [originalPrice, stockDate, expiryDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Product name is required.");
      return;
    }
    if (!originalPrice || parseFloat(originalPrice) <= 0) {
      setErrorMsg("Please enter a valid original price.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await saveProduct({
        name: name.trim(),
        category,
        originalPrice: parseFloat(originalPrice),
        unit: unit.trim() || "item",
        stockDate,
        expiryDate,
        imageUrl: imageUrl.trim() || undefined,
        brand: brand.trim() || undefined,
        ingredients: ingredients.trim() || undefined,
        nutriscore,
        barcode: barcode.trim() || `93123${Date.now().toString().slice(-8)}`,
        description: description.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg("Product successfully saved to database! Redirecting...");
        setTimeout(() => {
          router.push("/business");
          router.refresh();
        }, 1000);
      } else {
        setErrorMsg(res.error || "Failed to save product.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFDF9] text-[#304721] py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/business"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#304721] transition-all hover:border-[#3C9F47]"
          >
            <ArrowLeft className="h-4 w-4 text-[#3C9F47]" />
            Back to Dashboard
          </Link>

          <span className="text-xs font-bold text-[#53863D]">
            Retail Inventory Upload Form
          </span>
        </div>

        <div className="mb-8 border-b border-slate-200/80 pb-4">
          <h1 className="text-3xl font-black text-[#304721] flex items-center gap-2">
            <PlusCircle className="h-8 w-8 text-[#3C9F47]" />
            Upload New Food Product
          </h1>
          <p className="text-xs text-[#53863D] mt-1">
            Add custom grocery items to your inventory. Connected to Supabase backend table.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Form (Left 7 Cols) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl border border-slate-200/90">
              {errorMsg && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
                  ⚠️ {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl bg-[#3C9F47]/10 p-3 text-xs font-bold text-[#304721] border border-[#3C9F47]/30">
                  <CheckCircle2 className="inline h-4 w-4 mr-1 text-[#3C9F47]" />
                  {successMsg}
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-[#304721] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Honeycrisp Apples"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                  id="create-product-name"
                />
              </div>

              {/* Category & Brand row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#304721] mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                    id="create-product-category"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#304721] mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Valley Fresh Farms"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                    id="create-product-brand"
                  />
                </div>
              </div>

              {/* Price & Unit row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#304721] mb-1">
                    Original Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5.99"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                    id="create-product-price"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#304721] mb-1">
                    Unit Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kg, 500g pack, punnet"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                    id="create-product-unit"
                  />
                </div>
              </div>

              {/* Stock Date & Expiry Date row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#304721] mb-1">
                    Stock Received Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={stockDate}
                    onChange={(e) => setStockDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                    id="create-product-stockdate"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#304721] mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                    id="create-product-expirydate"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-[#304721] mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                  id="create-product-imageurl"
                />
              </div>

              {/* Ingredients & Nutri-Score */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#304721] mb-1">
                    Ingredients List
                  </label>
                  <input
                    type="text"
                    placeholder="100% Organic Fresh Produce"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                    id="create-product-ingredients"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#304721] mb-1">
                    Nutri-Score
                  </label>
                  <select
                    value={nutriscore}
                    onChange={(e) => setNutriscore(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                    id="create-product-nutriscore"
                  >
                    <option value="A">Nutri-Score A</option>
                    <option value="B">Nutri-Score B</option>
                    <option value="C">Nutri-Score C</option>
                    <option value="D">Nutri-Score D</option>
                    <option value="E">Nutri-Score E</option>
                  </select>
                </div>
              </div>

              {/* Barcode & Description */}
              <div>
                <label className="block text-xs font-bold text-[#304721] mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed food item description and storage instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-[#304721] outline-none focus:border-[#3C9F47] focus:bg-white"
                  id="create-product-description"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl border border-[#304721] bg-[#304721] text-xs font-bold text-white hover:bg-[#3C9F47] transition-colors"
                id="create-product-submit"
              >
                {submitting ? "Uploading to Supabase..." : "+ Upload Product to Inventory"}
              </button>
            </form>
          </div>

          {/* Live AI Pricing Preview Card (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-[#3C9F47]/30 bg-gradient-to-br from-[#FAFDF9] via-white to-[#3C9F47]/10 p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#304721] flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#3C9F47]" />
                  Live AI Pricing Calculation
                </span>
                <span className="rounded-full bg-[#3C9F47]/10 border border-[#3C9F47]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#304721]">
                  PREVIEW
                </span>
              </div>

              {/* Image Preview Box */}
              <div className="relative mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 border border-slate-200">
                {imageUrl.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon className="h-8 w-8 mb-1" />
                    <span className="text-[11px]">Image Preview</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-[#304721] truncate mb-1">
                {name || "Product Name"}
              </h3>
              <p className="text-xs text-[#53863D] mb-4">{brand || "Brand"} &bull; {category}</p>

              {/* AI Calculated Price & Discount */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">AI DYNAMIC PRICE</span>
                    <span className="text-3xl font-black text-[#304721]">
                      ${aiPricingPreview.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">/{unit}</span>
                  </div>

                  {aiPricingPreview.discount > 0 && (
                    <div className="text-right">
                      <span className="rounded bg-red-600 text-white px-2 py-0.5 text-xs font-black block mb-1">
                        -{aiPricingPreview.discount}% OFF
                      </span>
                      <span className="text-xs text-slate-400 line-through font-semibold">
                        ${(parseFloat(originalPrice) || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Freshness score gauge */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#53863D]">Freshness Score:</span>
                  <span className="text-[#304721]">{aiPricingPreview.freshnessScore}% ({aiPricingPreview.label})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-[#3C9F47]"
                    style={{ width: `${Math.max(aiPricingPreview.freshnessScore, 4)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {aiPricingPreview.daysRemaining < 0
                    ? "Product has passed expiry date"
                    : `${aiPricingPreview.daysRemaining} days remaining out of ${aiPricingPreview.totalShelfDays} days shelf life`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedCreateProductPage() {
  return <BusinessGate><CreateProductPage /></BusinessGate>;
}
