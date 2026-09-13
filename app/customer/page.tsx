"use client";

import AiResponse from "@/app/components/AiResponse";

import { useCallback, useEffect, useState } from "react";
import { StateBadge } from "@/components/StateBadge";
import type { Product } from "@/types";
import MealPrepChat from "@/app/components/MealPrepChat";

type AdviceResponse = {
  advice?: string;
  error?: string;
};

export default function CustomerDisplay() {
  const [mealProductIds, setMealProductIds] = useState<string[]>([]);
  function toggleMealProduct(id: string) {
    setMealProductIds(current => current.includes(id) ? current.filter(value => value !== id) : current.length < 8 ? [...current, id] : current);
  }
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/products", { cache: "no-store" });
    const data = await response.json();
    setProducts((data.products ?? []).filter((product: Product) => product.state !== "unsafe"));
  }, []);

  useEffect(() => {
    const firstRefresh = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 10_000);
    return () => {
      clearTimeout(firstRefresh);
      clearInterval(timer);
    };
  }, [refresh]);

  async function ask(product: Product) {
    setSelected(product);
    setAdvice("");
    setLoading(true);
    try {
      const response = await fetch("/api/advice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
      const body = (await response.text()).trim();
      let data: AdviceResponse | undefined;

      if (body) {
        try {
          data = JSON.parse(body) as AdviceResponse;
        } catch {
          // An intermediary may return an HTML or empty error response.
        }
      }

      if (!response.ok) {
        throw new Error(data?.error || "Advice is unavailable right now.");
      }
      setAdvice(data?.advice || data?.error || "Advice is unavailable.");
    } catch (error) {
      setAdvice(error instanceof Error ? error.message : "Advice is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="customer-page">
      <div className="customer-heading"><div><div className="eyebrow">TODAY&apos;S SMART SAVINGS</div><h1>Good food. Better timing.</h1><p>Prices respond to remaining shelf life and verified storage readings.</p></div><div className="waste-badge"><strong>{products.filter((p) => p.discountPercent > 0).length}</strong><span>rescue deals</span></div></div>
      <MealPrepChat products={products.map(product => ({ ...product, discountPercentage: product.discountPercent }))} selectedIds={mealProductIds} onToggleProduct={toggleMealProduct} onSelectProducts={setMealProductIds} />
      <section className="customer-grid">
        {products.map((product) => (
          <article className="price-card" key={product.id}>
            <div className="price-card-top"><StateBadge state={product.state} />{product.discountPercent > 0 && <span className="discount-burst">−{product.discountPercent}%</span>}</div>
            <div className="product-visual">{product.imageUrl ? <div className="product-photo" role="img" aria-label={product.name} style={{ backgroundImage: `url(${product.imageUrl})` }} /> : <span>{product.name.slice(0, 1)}</span>}</div>
            <p className="category">{product.category}</p><h2>{product.name}</h2>
            <div className="price-line"><strong>${product.currentPrice.toFixed(2)}</strong>{product.discountPercent > 0 && <del>${product.originalPrice.toFixed(2)}</del>}</div>
            <div className="freshness-meter"><div style={{ width: `${product.freshnessScore}%` }} /></div>
            <div className="card-facts"><span>Freshness <b>{product.freshnessScore}/100</b></span><span>Use by <b>{product.expiryDate}</b></span>{product.sensor && <span>Storage <b>{product.sensor.temperatureC.toFixed(1)}°C</b></span>}</div>
            {product.allergens.length > 0 && <p className="allergen"><b>Contains:</b> {product.allergens.join(", ")}</p>}
            <button type="button" className="meal-prep-card-select" aria-pressed={mealProductIds.includes(product.id)} disabled={!mealProductIds.includes(product.id) && mealProductIds.length >= 8} onClick={() => toggleMealProduct(product.id)}>{mealProductIds.includes(product.id) ? "Added to meal plan" : "+ Add to meal plan"}</button>
            <button className="button primary full" onClick={() => ask(product)}>How should I store this?</button>
          </article>
        ))}
      </section>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="advice-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}>×</button><div className="ai-mark">AI</div><span className="section-kicker">GROQ STORAGE GUIDE</span><h2>{selected.name}</h2>{loading ? <p className="loading-line">Preparing guidance…</p> : <AiResponse text={advice} />}<p className="fine-print">Always follow the package label and local food-safety guidance. Sensor readings and AI advice are not a safety guarantee.</p></section></div>}
    </main>
  );
}
