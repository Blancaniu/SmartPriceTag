/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Tag,
  Search,
  Package,
  TrendingDown,
  AlertTriangle,
  PiggyBank,
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
import { getCustomProducts, resolveCurrentSession, logoutUser, UserSession } from "@/app/lib/supabaseClient";
import PriceRangeSlider from "./PriceRangeSlider";
import { PriceRange } from "@/app/lib/pricePreferences";
import { applyPricePreference } from "@/app/lib/pricePreferences";
import StatsCard from "./StatsCard";
import FoodCard from "./FoodCard";
import WeatherPricing from "./WeatherPricing";
import BusinessInventory from "./BusinessInventory";
import MealPrepChat from "./MealPrepChat";
import FreshnessSlider, { FilterMode, SortOrder } from "./FreshnessSlider";

export default function Dashboard({ business = false }: { business?: boolean }) {
  const router = useRouter();
  const [mealProductIds, setMealProductIds] = useState<string[]>([]);
  function toggleMealProduct(id: string) {
    setMealProductIds(current => current.includes(id) ? current.filter(value => value !== id) : current.length < 8 ? [...current, id] : current);
  }
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
  const [sortOrder, setSortOrder] = useState<SortOrder>(business ? "least-fresh" : "freshest");

  const [personalPriceRange, setPersonalPriceRange] = useState<PriceRange | null>(null);
  const priceCeiling = Math.max(1, Math.ceil(Math.max(...items.map(item => item.discountedPrice), 0)));
  const activePriceRange = personalPriceRange || { min: 0, max: priceCeiling };

  // Fetch OpenFoodFacts + Supabase user created products on mount
  useEffect(() => {
    resolveCurrentSession().then(setUserSession).catch(() => setUserSession(null));

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
          const customProcessed = customProds.map(item => calculatePricing(item, undefined, apiRes?.weather));
          // Combine custom user products at top of list
          setItems([...customProcessed, ...baseProcessed].map(applyPricePreference));
        } else {
          setItems(baseProcessed.map(applyPricePreference));
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
    let result = business ? items : items.filter(item => item.daysUntilExpiry >= 0);

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

    if (!business && personalPriceRange) {
      result = result.filter(item => item.discountedPrice >= personalPriceRange.min && item.discountedPrice <= personalPriceRange.max);
    }

    result = [...result].sort((a, b) =>
      sortOrder === "freshest"
        ? b.freshnessScore - a.freshnessScore
        : a.freshnessScore - b.freshnessScore
    );

    return result;
  }, [items, selectedCategory, searchQuery, freshnessValue, filterMode, sortOrder, business, personalPriceRange]);

  // ── Stats Summary ────────────────────────────────────
  const stats = useMemo(() => {
    const availableItems = business ? items : items.filter(item => item.daysUntilExpiry >= 0);
    const totalItems = availableItems.length;
    const avgDiscount =
      availableItems.reduce((sum, i) => sum + i.discountPercentage, 0) / (totalItems || 1);
    const expiringSoon = availableItems.filter(
      (i) => i.daysUntilExpiry <= 2 && i.daysUntilExpiry >= 0
    ).length;
    const expired = items.filter(item => item.daysUntilExpiry < 0).length;
    const bestDiscount = Math.max(0, ...availableItems.map(item => item.discountPercentage));
    return { totalItems, avgDiscount, expiringSoon, expired, bestDiscount };
  }, [items, business]);

  const todayStr = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`${business ? "business-dashboard" : "foodmart"} min-h-screen`}>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────── */}
        <header className="fm-header">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#203B2A] text-white">
                <Tag className="h-6 w-6 text-[#BCD980]" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#203B2A]">
                  F-<span className="text-[#2D7545]">freshie</span>
                </h1>
                <p className="text-xs font-extrabold text-[#536B50] uppercase tracking-wider">
                  {business ? "Business · Dynamic Retail Pricing Dashboard" : "Personal · Fresh Food & Savings"}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {business ? "AI freshness evaluation, shelf-life monitoring & dynamic discount management" : "Discover fresh products and find your next food bargain"}
            </p>
          </div>

          <form className="fm-search" onSubmit={e => { e.preventDefault(); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}><label className="sr-only" htmlFor="fm-search">Search products</label><input id="fm-search" placeholder="Search for products, brands and more" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /><button aria-label="Search products"><Search size={21} /></button></form>
          {/* Right Header Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Create Product Button */}
            {business && <Link
              href="/create-product"
              className="flex items-center gap-1.5 rounded-xl border border-[#203B2A] bg-[#203B2A] px-4 py-2 text-xs font-bold text-white hover:bg-[#2D7545] transition-all"
              id="header-create-product-button"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Product</span>
            </Link>}
            <Link href={business ? "/" : "/business"} className="text-xs font-bold text-[#203B2A] underline">{business ? "View customer storefront" : userSession?.accountType === "business" ? "Business dashboard" : "Business sign in"}</Link>

            {/* Auth Session Button */}
            {userSession ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#203B2A]">
                <User className="h-4 w-4 text-[#2D7545]" />
                <span className="max-w-[120px] truncate">{userSession.email}</span>
                <button
                  onClick={async () => {
                    await logoutUser();
                    setUserSession(null);
                    if (business) router.push("/");
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
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#203B2A] hover:border-[#2D7545] transition-all"
                id="header-login-button"
              >
                <User className="h-4 w-4 text-[#2D7545]" />
                <span>Sign In</span>
              </Link>
            )}

            
          </div>
        </header>
        {business ? (
          <>
            <nav className="fm-nav" aria-label="Business navigation"><a href="#overview">Overview</a><a href="#products">Inventory</a><a href="#weather">Pricing conditions</a><Link href="/create-product">Add product</Link></nav>
            <section id="overview" className="business-overview">
              <div><p className="text-xs font-bold uppercase tracking-widest text-[#BCD980]">Business workspace</p><h2>Keep stock moving.<br />Reduce food waste.</h2><p>Review expiry dates, monitor markdowns, and manage product pricing from one place.</p><a href="#products" className="inline-block mt-5 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#203B2A]">Manage inventory &rarr;</a></div>
              <div className="business-attention"><AlertTriangle className="h-6 w-6 text-[#BCD980]" /><h3>Needs your attention</h3><p><strong>{stats.expiringSoon}</strong> products expire within 2 days</p><p><strong>{stats.expired}</strong> expired products to review</p><span>Inventory is sorted by lowest freshness first.</span></div>
            </section>
          </>
        ) : (
          <>
            <nav className="fm-nav" aria-label="Store navigation"><a href="#categories">Shop by category</a><a href="#products">All products</a><a href="#filters">My budget &amp; freshness</a><a href="#meal-prep">AI meal prep</a></nav>
        <section className="fm-banners" aria-label="Explore our groceries">
          <div className="fm-main-banner"><div><p className="fm-eyebrow">Fresh choices, every day</p><h2>Good food.<br />Even better value.</h2><p>Discover fresh favourites and thoughtful prices that help good food go further.</p><a href="#products" className="fm-cta">Explore products &rarr;</a></div><img src="/foodmart/product-thumb-1.png" alt="Fruit juice bottle" /></div>
          <a href="#products" onClick={() => setSelectedCategory("Fruits")} className="fm-promo fm-produce"><span>Fresh from the produce aisle</span><h3>Fruits &amp;<br />Vegetables</h3><span>Explore fruits &rarr;</span></a>
          <a href="#products" onClick={() => setSelectedCategory("Bakery")} className="fm-promo fm-bakery"><span>A little everyday comfort</span><h3>Bakery<br />favourites</h3><span>Shop collection &rarr;</span></a>
        </section>
        <section id="categories" className="fm-categories"><div className="fm-section-title"><h2>Shop by category</h2><a href="#products" onClick={() => setSelectedCategory("All")}>View all products &rarr;</a></div><div className="fm-category-grid">{CATEGORIES.map((cat, i) => <a key={cat} href="#products" onClick={() => setSelectedCategory(cat)} className={selectedCategory === cat ? "fm-category selected" : "fm-category"}><img alt="" src={`/foodmart/${["icon-vegetables-broccoli.png","icon-bread-herb-flour.png","icon-soft-drinks-bottle.png","icon-animal-products-drumsticks.png","icon-bread-baguette.png","icon-wine-glass-bottle.png"][i]}`} /><span>{cat}</span></a>)}</div></section>
          </>
        )}
        {business && <section id="weather" className="fm-weather"><div className="fm-section-title"><h2>Weather &amp; pricing conditions</h2></div><WeatherPricing weather={items[0]?.weather} editable /></section>}
        {!business && <MealPrepChat products={items.filter(item => item.daysUntilExpiry >= 0).map(item => ({ ...item, currentPrice: item.discountedPrice }))} selectedIds={mealProductIds} onToggleProduct={toggleMealProduct} onSelectProducts={setMealProductIds} />}
        <div id="products" className="fm-section-title"><h2>{business ? "Your inventory" : "Fresh finds for you"}</h2><span>{isLoadingApi ? "Updating products..." : todayStr}</span></div>
        {/* ── Stats row ──────────────────────────────── */}
        <div className={`mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 ${business ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          <StatsCard
            icon={Package}
            label={business ? "Inventory listings" : "Products to explore"}
            value={stats.totalItems}
            accentBg="bg-[#203B2A]/10"
            iconColor="text-[#203B2A]"
            delay={0}
          />
          <StatsCard
            icon={TrendingDown}
            label={business ? "Average markdown" : "Average available discount"}
            value={`${stats.avgDiscount.toFixed(1)}%`}
            accentBg="bg-[#2D7545]/15"
            iconColor="text-[#2D7545]"
            delay={50}
          />
          <StatsCard
            icon={AlertTriangle}
            label={business ? "Expiring within 2 days" : "Best available discount"}
            value={business ? stats.expiringSoon : `${stats.bestDiscount}%`}
            accentBg="bg-amber-500/15"
            iconColor="text-amber-600"
            delay={100}
          />
          {business && <StatsCard
            icon={PiggyBank}
            label="Expired listings to review"
            value={stats.expired}
            accentBg="bg-[#BCD980]/20"
            iconColor="text-[#203B2A]"
            delay={150}
          />}
        </div>

        {/* ── Interactive Freshness Slider ───────────── */}
        <div id="filters" className="mb-6">
          <FreshnessSlider
            personal={!business}
            freshnessValue={freshnessValue}
            onChangeFreshness={setFreshnessValue}
            filterMode={filterMode}
            onChangeFilterMode={setFilterMode}
            sortOrder={sortOrder}
            onChangeSortOrder={setSortOrder}
            matchingCount={filteredItems.length}
            totalCount={stats.totalItems}
          />
        </div>

        {!business && (
          <section className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-5">
            <h2 className="mb-4 text-sm font-extrabold text-[#203B2A]">Price range preference</h2>
            <PriceRangeSlider value={activePriceRange} ceiling={Math.max(priceCeiling, activePriceRange.max)} onChange={setPersonalPriceRange} />
          </section>
        )}

        {/* ── Category Pills & Search Bar ────────────── */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#536B50]" />
            <input
              type="text"
              placeholder="Search product, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-semibold text-[#203B2A] placeholder-slate-400 outline-none transition-colors focus:border-[#2D7545] focus:bg-white focus:ring-1 focus:ring-[#2D7545]"
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
                    ? "border-[#203B2A] bg-[#203B2A] text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#2D7545] hover:text-[#203B2A]"
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
            <span className="font-extrabold text-[#203B2A]">
              {filteredItems.length}
            </span>{" "}
            of <span className="font-bold text-slate-600">{stats.totalItems}</span> items
            {selectedCategory !== "All" && (
              <span>
                {" "}
                in <span className="font-extrabold text-[#2D7545]">{selectedCategory}</span>
              </span>
            )}
            {" "}
            ({filterMode === "below" ? `Freshness ≤ ${freshnessValue}%` : `Freshness ≥ ${freshnessValue}%`})
          </p>

          <span className="text-xs font-semibold text-[#536B50] hidden sm:block">
            {business ? "💡 Click any product to view detailed info & future price simulator" : "Click any product for ingredients and buying advice"}
          </span>
        </div>

        {/* ── Food Card Grid ─────────────────────────── */}
        {!business && mealProductIds.length > 0 && <div className="meal-prep-selection-summary"><span>{items.filter(item => item.daysUntilExpiry >= 0 && mealProductIds.includes(item.id)).length} products selected for meal prep</span><a href="#meal-prep">Plan meals with these items &rarr;</a></div>}
        {filteredItems.length > 0 ? (
          business ? <BusinessInventory items={filteredItems} /> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, i) => (
              <div key={item.id}>
                <FoodCard item={item} index={i} business={business} />
                {!business && <button type="button" className="meal-prep-card-select" aria-pressed={mealProductIds.includes(item.id)} disabled={!mealProductIds.includes(item.id) && mealProductIds.length >= 8} onClick={() => toggleMealProduct(item.id)}>{mealProductIds.includes(item.id) ? "Added to meal plan" : "+ Add to meal plan"}</button>}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white py-16">
            <Filter className="mb-3 h-10 w-10 text-[#536B50]" />
            <p className="text-base font-extrabold text-[#203B2A]">
              No products match current slider filter
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your filters or clearing search criteria
            </p>
            <button
              onClick={() => {
                setFreshnessValue(100);
                setFilterMode("below");
                setSelectedCategory("All");
                setSearchQuery("");
                setPersonalPriceRange(null);
              }}
              className="rounded-xl border border-[#203B2A] bg-[#203B2A] px-4 py-2 text-xs font-bold text-white hover:bg-[#2D7545] transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────── */}
        <footer className="mt-16 border-t border-slate-200/80 pt-6 text-center">
          <p className="text-xs font-semibold text-[#536B50]">
            F-freshie {business ? "Business Dashboard" : "Personal"} &bull; Design adapted from FoodMart by TemplatesJungle
          </p>
        </footer>
      </div>
    </div>
  );
}
