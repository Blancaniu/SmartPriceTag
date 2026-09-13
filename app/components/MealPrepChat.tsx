"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChefHat, Send, Sparkles, RotateCcw, LoaderCircle } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
type PlanContext = { ingredients: string; preferences: string; servings: number; days: number };

export type MealPrepProduct = { id: string; name: string; category: string; unit?: string; expiryDate: string; currentPrice: number; originalPrice: number; discountPercentage: number };

type Props = { products: MealPrepProduct[]; selectedIds: string[]; onToggleProduct: (id: string) => void; onSelectProducts: (ids: string[]) => void };

export default function MealPrepChat({ products, selectedIds, onToggleProduct, onSelectProducts }: Props) {
  const id = useId();
  const [cheapestCount, setCheapestCount] = useState(4);
  const [priceSort, setPriceSort] = useState(false);
  const [includeRecipes, setIncludeRecipes] = useState(false);
  const cheapestProducts = [...products].sort((a, b) => a.currentPrice - b.currentPrice || a.name.localeCompare(b.name));
  const displayedProducts = priceSort ? cheapestProducts : products;
  const selected = products.filter(product => selectedIds.includes(product.id));
  const totalCents = selected.reduce((sum, product) => sum + Math.round(product.currentPrice * 100), 0);
  const originalCents = selected.reduce((sum, product) => sum + Math.round(product.originalPrice * 100), 0);
  const ingredients = selected.map(product => `${product.name.slice(0, 120)} (${product.category}; listing unit: ${(product.unit || "not specified").slice(0, 40)}; price AUD $${product.currentPrice.toFixed(2)}; original $${product.originalPrice.toFixed(2)}; discount ${product.discountPercentage}%; use-by: ${product.expiryDate.slice(0, 10)})`).join("\n");
  const [preferences, setPreferences] = useState("");
  const [servings, setServings] = useState(2);
  const [days, setDays] = useState(3);
  const [context, setContext] = useState<PlanContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const followup = useRef<HTMLInputElement>(null);

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages, pending, error]);

  async function send(plan: PlanContext, history: Message[], content: string) {
    if (controller.current) return;
    const requestController = new AbortController();
    controller.current = requestController;
    const timeout = setTimeout(() => requestController.abort(), 35000);
    setPending(true);
    setError("");
    const next: Message[] = [...history, { role: "user", content }];
    // Keep complete recent exchanges; ingredients and preferences accompany every request.
    const recent = next.slice(-11);
    while (recent.length > 1 && recent.reduce((size, message) => size + message.content.length, 0) > 24000) {
      recent.splice(0, 2);
    }
    try {
      const response = await fetch("/api/meal-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...plan, messages: recent }),
        signal: requestController.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.reply !== "string" || !data.reply.trim()) {
        throw new Error(data?.error || "Couldn't load your meal plan. Please try again.");
      }
      setContext(plan);
      setMessages([...next, { role: "assistant", content: data.reply }]);
      setQuestion("");
      followup.current?.focus();
    } catch (error) {
      setError(error instanceof Error && error.name !== "AbortError" ? error.message : "The request took too long. Please try again.");
    } finally {
      clearTimeout(timeout);
      controller.current = null;
      setPending(false);
    }
  }

  return (
    <section id="meal-prep" className="meal-prep" aria-labelledby={`${id}-title`}>
      <div className="meal-prep-heading"><span className="meal-prep-icon"><ChefHat size={24} /></span><div><p className="meal-prep-eyebrow">A LITTLE HELP IN THE KITCHEN</p><h2 id={`${id}-title`}>Fresh finds. Your meal plan.</h2><p>Choose products from our listings and let AI turn them into a meal plan.</p></div><span className="meal-prep-ai"><Sparkles size={14} />AI meal prep</span></div>
      <div className="meal-prep-layout">
        <form className="meal-prep-ingredients" onSubmit={event => {
          event.preventDefault();
          void send({ ingredients: ingredients.trim(), preferences: preferences.trim(), servings, days }, [], "Create a practical meal-prep plan using these selected store products and my preferences. These are products I may buy, not ingredients I already own. Suggest quantities to buy and clearly identify anything extra needed." + (includeRecipes ? " Include a recipe for each meal with ingredient quantities for the planned servings, numbered cooking steps, preparation and cooking times, and batch-prep tips. Respect my dietary preferences." : ""));
        }}>
          <fieldset className="meal-prep-product-picker" disabled={pending}>
            <legend>Choose listed products ({selected.length}/8)</legend>
            <div className="meal-prep-budget-controls"><label htmlFor={`${id}-cheapest-count`}>Number of products<select id={`${id}-cheapest-count`} value={cheapestCount} onChange={event => setCheapestCount(Number(event.target.value))}>{Array.from({ length: 8 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></label><button type="button" disabled={products.length === 0} onClick={() => { onSelectProducts(cheapestProducts.slice(0, cheapestCount).map(product => product.id)); setPriceSort(true); }}>Choose cheapest</button></div>
            <p className="meal-prep-hint">Replaces your selection with the lowest current prices per listed unit, after discounts. Pack sizes vary.</p>
            <label className="meal-prep-price-sort"><input type="checkbox" checked={priceSort} onChange={event => setPriceSort(event.target.checked)} /> Show cheapest first</label>
            <div className="meal-prep-product-options">{displayedProducts.map(product => <label key={product.id} className="meal-prep-product-option"><input type="checkbox" checked={selectedIds.includes(product.id)} disabled={!selectedIds.includes(product.id) && selected.length >= 8} onChange={() => onToggleProduct(product.id)} /><span><strong>{product.name}</strong><small>{product.category}{product.unit ? ` / ${product.unit}` : ""}</small><small className="meal-prep-product-price"><b>${product.currentPrice.toFixed(2)}</b>{product.originalPrice > product.currentPrice && <del>${product.originalPrice.toFixed(2)}</del>}<em>{product.discountPercentage > 0 ? `${product.discountPercentage}% off` : "No discount"}</em></small></span></label>)}</div>
            {products.length === 0 && <p className="meal-prep-hint">No available products to plan with yet.</p>}
          </fieldset>
          {selected.length > 0 && <div className="meal-prep-cost-summary"><span>Selected products <strong>${(totalCents / 100).toFixed(2)}</strong></span><span>You save <strong>${(Math.max(0, originalCents - totalCents) / 100).toFixed(2)}</strong></span><small>AUD, one listed unit of each selected product. Your meal plan may need different quantities or extras.</small></div>}
          <div className="meal-prep-quick-actions meal-prep-recipe-option">
            <button type="button" disabled={pending} aria-pressed={includeRecipes} onClick={() => setIncludeRecipes(value => !value)}><ChefHat size={16} />Include recipes<span>{includeRecipes ? "On" : "Off"}</span></button>
            <p className="meal-prep-hint">Add quantities and step-by-step cooking instructions when you generate your plan.</p>
          </div>
          <p className="meal-prep-hint">Pick up to 8 products here or use Add to meal plan on a product card.</p>
          {context && ingredients !== context.ingredients && <p className="meal-prep-hint">Selection changed. Create a new plan to use these products; follow-up chat still refers to your previous plan.</p>}
          <div className="meal-prep-numbers"><label htmlFor={`${id}-people`}>People<input id={`${id}-people`} type="number" required min={1} max={12} value={servings} onChange={event => setServings(Number(event.target.value))} disabled={pending} /></label><label htmlFor={`${id}-days`}>Days to plan<input id={`${id}-days`} type="number" required min={1} max={7} value={days} onChange={event => setDays(Number(event.target.value))} disabled={pending} /></label></div>
          <label htmlFor={`${id}-preferences`}>Dietary needs &amp; preferences <span>(optional)</span></label>
          <textarea id={`${id}-preferences`} maxLength={1000} value={preferences} onChange={event => setPreferences(event.target.value)} placeholder="Allergies, vegetarian, budget, cooking time…" rows={2} disabled={pending} />
          <button className="meal-prep-plan" type="submit" disabled={pending || !ingredients.trim()}>{pending ? <LoaderCircle className="animate-spin" size={17} /> : <Sparkles size={17} />}{pending ? "Preparing your reply…" : context ? "Create a new plan" : "Plan my meals"}</button>
          <p className="meal-prep-hint">Your selected products and messages are sent to our AI provider to prepare your plan.</p>
        </form>
        <div className="meal-prep-conversation">
          <div className="meal-prep-chat-header"><span><ChefHat size={18} />Meal-prep assistant</span><button type="button" disabled={pending || messages.length === 0} onClick={() => { setMessages([]); setContext(null); setQuestion(""); setError(""); }} aria-label="Clear meal-prep conversation" title="Clear conversation"><RotateCcw size={16} /></button></div>
          <div className="meal-prep-transcript" ref={transcript} role="log" aria-label="Meal-prep conversation" aria-live="polite" aria-relevant="additions text" aria-busy={pending}>
            {messages.length === 0 && <div className="meal-prep-welcome"><span><ChefHat size={32} /></span><h3>Let’s cook something good.</h3><p>Choose from the listed products and I can suggest meals, quantities to buy, and a batch-cooking plan.</p><div className="meal-prep-example"><strong>{selected.length ? `${selected.length} products selected. Ready to plan!` : "Select products to get started."}</strong></div></div>}
            {context && <p className="meal-prep-context">Planning for {context.servings} {context.servings === 1 ? "person" : "people"} over {context.days} {context.days === 1 ? "day" : "days"}<span className="meal-prep-plan-products">Using: {context.ingredients.split("\n").map(line => line.split(" (")[0]).join(", ")}</span></p>}
            {messages.map((message, index) => <div key={index} className={`meal-prep-message ${message.role}`}><span>{message.role === "user" ? "You" : "Meal-prep assistant"}</span><p>{message.content}</p></div>)}
            {pending && <p className="meal-prep-thinking"><LoaderCircle className="animate-spin" size={16} />Putting your meal ideas together…</p>}
          </div>
          {error && <p className="meal-prep-error" role="alert">{error} Your inputs are saved here; submit again to retry.</p>}
          <form className="meal-prep-followup" onSubmit={event => { event.preventDefault(); if (context && question.trim()) void send(context, messages, question.trim()); }}><label className="sr-only" htmlFor={`${id}-question`}>Ask about your meal plan</label><input ref={followup} id={`${id}-question`} value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} placeholder={context ? "Ask for a swap, a recipe, or a quicker option…" : "Create a plan to start chatting…"} disabled={!context || pending} /><button type="submit" aria-label="Send meal-prep question" disabled={!context || pending || !question.trim()}><Send size={18} /></button></form>
          <p className="meal-prep-footnote">Check food labels and use-by dates when preparing your meals.</p>
        </div>
      </div>
    </section>
  );
}
