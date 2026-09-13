"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Tag,
  Search,
  Package,
  TrendingDown,
  AlertTriangle,
  PiggyBank,
  Sparkles,
  RefreshCw,
  Store,
  CheckCircle2,
  Filter,
  PlusCircle,
  User,
  LogOut,
} from "lucide-react";
import {
  getProcessedFoodItems,
  ProcessedFoodItem,
  calculatePricing,
} from "@/app/lib/pricingEngine";
import { CATEGORIES, FoodCategory } from "@/app/data/foodData";
import { getCustomProducts, getCurrentSession, logoutUser, UserSession } from "@/app/lib/supabaseClient";
import StatsCard from "./StatsCard";
import FoodCard from "./FoodCard";
import FreshnessSlider, { FilterMode, SortOrder } from "./FreshnessSlider";

export default function Dashboard() {
  const [items, setItems] = useState<ProcessedFoodItem[]>(() =>
    getProcessedFoodItems()
  );
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Filter & Slider state
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | FoodCategory
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [freshnessValue, setFreshnessValue] = useState<number>(100);
  const [filterMode, setFilterMode] = useState<FilterMode>("below");
  const [sortOrder, setSortOrder] = useState<SortOrder>("freshest");

  // Fetch OpenFoodFacts + Supabase user created products on mount
  useEffect(() => {
    setUserSession(getCurrentSession());

    async function loadData() {
      try {
        const [apiRes, customProds] = await Promise.all([
          fetch("/api/products").then((r) => (r.ok ? r.json() : null)),
          getCustomProducts(),
        ]);

        let baseProcessed: ProcessedFoodItem[] = getProcessedFoodItems();

        if (apiRes && apiRes.items && apiRes.items.length > 0) {
          baseProcessed = apiRes.items;
        }

        if (customProds && customProds.length > 0) {
          const customProcessed = customProds.map(calculatePricing);
          // Combine custom user products at top of list
          setItems([...customProcessed, ...baseProcessed]);
        } else {
          setItems(baseProcessed);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setIsLoadingApi(false);
      }
    }
    loadData();
  }, []);

  // ── Filtered & Sorted items ──────────────────────────
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== "All") {
      result = result.filter((i) => i.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.brand && i.brand.toLowerCase().includes(q))
      );
    }

    if (filterMode === "below") {
      result = result.filter((i) => i.freshnessScore <= freshnessValue);
    } else {
      result = result.filter((i) => i.freshnessScore >= freshnessValue);
    }

    result = [...result].sort((a, b) =>
      sortOrder === "freshest"
        ? b.freshnessScore - a.freshnessScore
        : a.freshnessScore - b.freshnessScore
    );

    return result;
  }, [items, selectedCategory, searchQuery, freshnessValue, filterMode, sortOrder]);

  // ── Stats Summary ────────────────────────────────────
  const stats = useMemo(() => {
    const totalItems = items.length;
    const avgDiscount =
      items.reduce((sum, i) => sum + i.discountPercentage, 0) / (totalItems || 1);
    const expiringSoon = items.filter(
      (i) => i.daysUntilExpiry <= 2 && i.daysUntilExpiry >= 0
    ).length;
    const totalSavings = items.reduce(
      (sum, i) => sum + (i.originalPrice - i.discountedPrice),
      0
    );

    return { totalItems, avgDiscount, expiringSoon, totalSavings };
  }, [items]);

  const todayStr = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#FAFDF9]">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────── */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/80 pb-6">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#304721] text-white">
                <Tag className="h-6 w-6 text-[#6BB744]" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#304721]">
                  Smart
                  <span className="text-[#3C9F47]">
                    PriceTag
                  </span>
                </h1>
                <p className="text-xs font-extrabold text-[#53863D] uppercase tracking-wider">
                  Open Food Facts Dynamic Retail Pricing Dashboard
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              AI freshness evaluation, shelf-life monitoring &amp; dynamic discount management
            </p>
          </div>

          {/* Right Header Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Create Product Button */}
            <Link
              href="/create-product"
              className="flex items-center gap-1.5 rounded-xl border border-[#304721] bg-[#304721] px-4 py-2 text-xs font-bold text-white hover:bg-[#3C9F47] transition-all"
              id="header-create-product-button"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Product</span>
            </Link>

            {/* Auth Session Button */}
            {userSession ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#304721]">
                <User className="h-4 w-4 text-[#3C9F47]" />
                <span className="max-w-[120px] truncate">{userSession.email}</span>
                <button
                  onClick={async () => {
                    await logoutUser();
                    setUserSession(null);
                  }}
                  title="Sign Out"
                  className="ml-1 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#304721] hover:border-[#3C9F47] transition-all"
                id="header-login-button"
              >
                <User className="h-4 w-4 text-[#3C9F47]" />
                <span>Sign In</span>
              </Link>
            )}

            
          </div>
        </header>

        {/* ── Stats row ──────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={Package}
            label="Total Products"
            value={stats.totalItems}
            accentBg="bg-[#304721]/10"
            iconColor="text-[#304721]"
            delay={0}
          />
          <StatsCard
            icon={TrendingDown}
            label="Avg. AI Discount"
            value={`${stats.avgDiscount.toFixed(1)}%`}
            accentBg="bg-[#3C9F47]/15"
            iconColor="text-[#3C9F47]"
            delay={50}
          />
          <StatsCard
            icon={AlertTriangle}
            label="Expiring Soon (≤2d)"
            value={stats.expiringSoon}
            accentBg="bg-amber-500/15"
            iconColor="text-amber-600"
            delay={100}
          />
          <StatsCard
            icon={PiggyBank}
            label="Total Waste Savings"
            value={`$${stats.totalSavings.toFixed(2)}`}
            accentBg="bg-[#6BB744]/20"
            iconColor="text-[#304721]"
            delay={150}
          />
        </div>

        {/* ── Interactive Freshness Slider ───────────── */}
        <div className="mb-6">
          <FreshnessSlider
            freshnessValue={freshnessValue}
            onChangeFreshness={setFreshnessValue}
            filterMode={filterMode}
            onChangeFilterMode={setFilterMode}
            sortOrder={sortOrder}
            onChangeSortOrder={setSortOrder}
            matchingCount={filteredItems.length}
            totalCount={items.length}
          />
        </div>

        {/* ── Category Pills & Search Bar ────────────── */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#53863D]" />
            <input
              type="text"
              placeholder="Search product, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-semibold text-[#304721] placeholder-slate-400 outline-none transition-colors focus:border-[#3C9F47] focus:bg-white focus:ring-1 focus:ring-[#3C9F47]"
              id="dashboard-search-input"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(["All", ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as "All" | FoodCategory)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                  selectedCategory === cat
                    ? "border-[#304721] bg-[#304721] text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#3C9F47] hover:text-[#304721]"
                }`}
                id={`category-pill-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results Summary Header ─────────────────── */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-600">
            Showing{" "}
            <span className="font-extrabold text-[#304721]">
              {filteredItems.length}
            </span>{" "}
            of <span className="font-bold text-slate-600">{items.length}</span> items
            {selectedCategory !== "All" && (
              <span>
                {" "}
                in <span className="font-extrabold text-[#3C9F47]">{selectedCategory}</span>
              </span>
            )}
            {" "}
            ({filterMode === "below" ? `Freshness ≤ ${freshnessValue}%` : `Freshness ≥ ${freshnessValue}%`})
          </p>

          <span className="text-xs font-semibold text-[#53863D] hidden sm:block">
            💡 Click any product to view detailed info &amp; future price simulator
          </span>
        </div>

        {/* ── Food Card Grid ─────────────────────────── */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, i) => (
              <FoodCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white py-16">
            <Filter className="mb-3 h-10 w-10 text-[#53863D]" />
            <p className="text-base font-extrabold text-[#304721]">
              No products match current slider filter
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting the freshness slider range or clearing search criteria
            </p>
            <button
              onClick={() => {
                setFreshnessValue(100);
                setFilterMode("below");
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="rounded-xl border border-[#304721] bg-[#304721] px-4 py-2 text-xs font-bold text-white hover:bg-[#3C9F47] transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────── */}
        <footer className="mt-16 border-t border-slate-200/80 pt-6 text-center">
          <p className="text-xs font-semibold text-[#53863D]">
            SmartPriceTag Retail Dashboard &bull; 
          </p>
        </footer>
      </div>
    </div>
  );
}
