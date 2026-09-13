export async function GET(_request: Request, context: RouteContext<"/api/open-food-facts/[barcode]">) {
  const { barcode } = await context.params;
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`, {
    headers: { "User-Agent": "SmartPriceTag/1.0 (student hackathon project)" },
    cache: "no-store",
  });
  if (!response.ok) return Response.json({ error: "Open Food Facts lookup failed." }, { status: 502 });
  const data = await response.json();
  if (data.status !== 1) return Response.json({ error: "Product not found." }, { status: 404 });
  const product = data.product ?? {};
  return Response.json({
    product: {
      barcode,
      name: product.product_name || product.generic_name || "Unknown product",
      category: product.categories?.split(",")[0] || "Food",
      ingredients: product.ingredients_text ? String(product.ingredients_text).split(",").map((item: string) => item.trim()).slice(0, 12) : [],
      allergens: product.allergens_tags?.map((item: string) => item.replace(/^en:/, "")) || [],
      imageUrl: product.image_front_small_url || product.image_url || undefined,
    },
    note: "Expiry date must be entered from the physical item; Open Food Facts does not provide item-specific expiry dates.",
  });
}
