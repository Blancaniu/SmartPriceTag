// OpenFoodFacts API Integration Service
import { FoodItem, foodItems, FoodCategory } from "@/app/data/foodData";

interface OFFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  ingredients_text?: string;
  nutriscore_grade?: string;
  categories_tags?: string[];
  quantity?: string;
}

function mapCategory(categories: string[] = []): FoodCategory {
  const catString = categories.join(" ").toLowerCase();
  if (catString.includes("fruit")) return "Fruits";
  if (catString.includes("vegetable") || catString.includes("salad")) return "Vegetables";
  if (catString.includes("dairy") || catString.includes("milk") || catString.includes("cheese") || catString.includes("yogurt")) return "Dairy";
  if (catString.includes("meat") || catString.includes("chicken") || catString.includes("beef") || catString.includes("pork")) return "Meat";
  if (catString.includes("bread") || catString.includes("bakery") || catString.includes("pastry")) return "Bakery";
  if (catString.includes("fish") || catString.includes("seafood") || catString.includes("salmon")) return "Seafood";
  
  return "Fruits";
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * Fetches real products from Open Food Facts API and converts them into FoodItem objects.
 */
export async function fetchOpenFoodFactsProducts(): Promise<FoodItem[]> {
  try {
    const res = await fetch(
      "https://world.openfoodfacts.org/api/v2/search?categories_tags_en=groceries&fields=code,product_name,brands,image_front_url,image_url,ingredients_text,nutriscore_grade,categories_tags,quantity&page_size=15",
      {
        headers: {
          "User-Agent": "SmartPriceTagApp/1.0 (contact@smartpricetag.com)",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.warn("OpenFoodFacts API returned status", res.status);
      return [];
    }

    const data = await res.json();
    const products: OFFProduct[] = data.products || [];

    const mappedItems: FoodItem[] = products
      .filter((p) => p.product_name && (p.image_front_url || p.image_url))
      .map((p, idx) => {
        const category = mapCategory(p.categories_tags);
        const imageUrl = p.image_front_url || p.image_url || "";
        const originalPrice = parseFloat((3.99 + (idx % 7) * 2.5).toFixed(2));
        const stockDaysAgo = 1 + (idx % 5);
        const expiryDaysRemaining = (idx % 8) - 1;

        return {
          id: `off-${p.code}`,
          name: p.product_name || "Food Product",
          category,
          originalPrice,
          unit: p.quantity || "item",
          stockDate: dateOffset(-stockDaysAgo),
          expiryDate: dateOffset(expiryDaysRemaining),
          brand: p.brands || "Organic Select",
          imageUrl,
          ingredients: p.ingredients_text || "Natural ingredients, no artificial preservatives.",
          nutriscore: p.nutriscore_grade?.toUpperCase() || "A",
          barcode: p.code,
          description: `Authentic ${p.product_name} by ${p.brands || "Quality Foods"}. Sourced and verified via Open Food Facts database.`,
        };
      });

    return mappedItems;
  } catch (err) {
    console.error("Error fetching OpenFoodFacts products:", err);
    return [];
  }
}

/**
 * Returns combined food database items
 */
export async function getAllFoodItems(): Promise<FoodItem[]> {
  const liveOFF = await fetchOpenFoodFactsProducts();
  if (liveOFF.length > 0) {
    const existingIds = new Set(foodItems.map((f) => f.id));
    const uniqueLive = liveOFF.filter((item) => !existingIds.has(item.id));
    return [...foodItems, ...uniqueLive];
  }
  return foodItems;
}
