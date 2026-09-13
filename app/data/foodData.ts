// Enhanced Food Item definition with OpenFoodFacts attributes

export type FoodCategory =
  | "Fruits"
  | "Vegetables"
  | "Dairy"
  | "Meat"
  | "Bakery"
  | "Seafood";

export const CATEGORIES: FoodCategory[] = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Bakery",
  "Seafood",
];

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  originalPrice: number;
  unit: string;
  stockDate: string; // ISO date string
  expiryDate: string; // ISO date string
  imageUrl?: string;
  brand?: string;
  ingredients?: string;
  nutriscore?: string;
  barcode?: string;
  description?: string;
}

// Helper to calculate offset days from today
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const foodItems: FoodItem[] = [
  // ── Fruits ──────────────────────────────────────────
  {
    id: "f1",
    name: "Organic Fresh Strawberries",
    category: "Fruits",
    originalPrice: 6.99,
    unit: "250g punnet",
    stockDate: dateOffset(-3),
    expiryDate: dateOffset(2),
    brand: "Driscoll's Organic",
    imageUrl:
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
    ingredients: "100% Australian Certified Organic Strawberries",
    nutriscore: "A",
    barcode: "9312345678901",
    description:
      "Sweet, juicy hand-picked organic strawberries grown under sunny skies. Packed rich in Vitamin C, antioxidants, and dietary fiber.",
  },
  {
    id: "f2",
    name: "Cavendish Bananas Cluster",
    category: "Fruits",
    originalPrice: 3.49,
    unit: "kg",
    stockDate: dateOffset(-1),
    expiryDate: dateOffset(5),
    brand: "Tropical Sun",
    imageUrl:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
    ingredients: "Fresh Cavendish Bananas",
    nutriscore: "A",
    barcode: "9312345678902",
    description:
      "Naturally ripened premium Cavendish bananas. Excellent source of potassium, energy, and vitamin B6 for daily nutrition.",
  },
  {
    id: "f3",
    name: "Crisp Fuji Apples",
    category: "Fruits",
    originalPrice: 5.29,
    unit: "kg",
    stockDate: dateOffset(-5),
    expiryDate: dateOffset(9),
    brand: "Orchard Select",
    imageUrl:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
    ingredients: "100% Fresh Fuji Apples",
    nutriscore: "A",
    barcode: "9312345678903",
    description:
      "Super sweet and firm Fuji apples with a satisfying crunch. Perfect for healthy snacking, salad slicing, or baking pies.",
  },
  {
    id: "f4",
    name: "Fresh Australian Blueberries",
    category: "Fruits",
    originalPrice: 4.99,
    unit: "125g punnet",
    stockDate: dateOffset(-4),
    expiryDate: dateOffset(1),
    brand: "Mountain Berry Farm",
    imageUrl:
      "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80",
    ingredients: "Fresh Blueberries",
    nutriscore: "A",
    barcode: "9312345678904",
    description:
      "Plump, sweet blueberry superfood packed with natural antioxidants and phytonutrients. Ideal for breakfast bowls and smoothies.",
  },
  {
    id: "f5",
    name: "Valencia Navel Oranges",
    category: "Fruits",
    originalPrice: 4.49,
    unit: "kg",
    stockDate: dateOffset(-2),
    expiryDate: dateOffset(12),
    brand: "Riverland Gold",
    imageUrl:
      "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80",
    ingredients: "Fresh Navel Oranges",
    nutriscore: "A",
    barcode: "9312345678905",
    description:
      "Juicy and refreshing Australian navel oranges bursting with natural citrus flavor and immune-boosting Vitamin C.",
  },

  // ── Vegetables ──────────────────────────────────────
  {
    id: "v1",
    name: "Baby Spinach Leaves",
    category: "Vegetables",
    originalPrice: 3.99,
    unit: "280g bag",
    stockDate: dateOffset(-2),
    expiryDate: dateOffset(3),
    brand: "Fresh Salad Co",
    imageUrl:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
    ingredients: "Washed & Ready-to-Eat Baby Spinach Leaves",
    nutriscore: "A",
    barcode: "9312345678906",
    description:
      "Tender triple-washed baby spinach leaves. Packed with iron, folate, and essential minerals for fresh salads and green juices.",
  },
  {
    id: "v2",
    name: "Vine-Ripened Roma Tomatoes",
    category: "Vegetables",
    originalPrice: 4.99,
    unit: "kg",
    stockDate: dateOffset(-3),
    expiryDate: dateOffset(4),
    brand: "SunRaysia Produce",
    imageUrl:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    ingredients: "Fresh Vine Tomatoes",
    nutriscore: "A",
    barcode: "9312345678907",
    description:
      "Rich red vine tomatoes with dense flavor and low moisture content. Ideal for pasta sauces, bruschetta, and salads.",
  },
  {
    id: "v3",
    name: "Sweet Yellow Corn",
    category: "Vegetables",
    originalPrice: 1.99,
    unit: "cob",
    stockDate: dateOffset(-1),
    expiryDate: dateOffset(6),
    brand: "Valley Fresh",
    imageUrl:
      "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    ingredients: "Fresh Sweet Corn Cobs",
    nutriscore: "A",
    barcode: "9312345678908",
    description:
      "Succulent sweet yellow corn on the cob. Delicious when steamed, roasted with butter, or cooked on the BBQ.",
  },
  {
    id: "v4",
    name: "Fresh Broccoli Heads",
    category: "Vegetables",
    originalPrice: 3.49,
    unit: "head",
    stockDate: dateOffset(-5),
    expiryDate: dateOffset(0),
    brand: "Green Harvest",
    imageUrl:
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80",
    ingredients: "100% Fresh Broccoli",
    nutriscore: "A",
    barcode: "9312345678909",
    description:
      "Nutrient-dense dark green broccoli florets. Loaded with Vitamin K, Vitamin C, and fiber.",
  },

  // ── Dairy ───────────────────────────────────────────
  {
    id: "d1",
    name: "Pure Full Cream Milk",
    category: "Dairy",
    originalPrice: 3.29,
    unit: "2L bottle",
    stockDate: dateOffset(-4),
    expiryDate: dateOffset(3),
    brand: "Dairy Farmers Australia",
    imageUrl:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
    ingredients: "100% Australian Pasteurised Whole Milk",
    nutriscore: "B",
    barcode: "9312345678910",
    description:
      "Rich and creamy farm-fresh full cream milk. High in natural calcium and protein for strong bones and daily vitality.",
  },
  {
    id: "d2",
    name: "Authentic Greek Yoghurt",
    category: "Dairy",
    originalPrice: 5.49,
    unit: "500g tub",
    stockDate: dateOffset(-2),
    expiryDate: dateOffset(10),
    brand: "Chobani Pure",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    ingredients: "Ultra-filtered Milk, Live Yoghurt Cultures (S. thermophilus, L. bulgaricus)",
    nutriscore: "A",
    barcode: "9312345678911",
    description:
      "Thick, velvety smooth strained Greek yoghurt containing live probiotics and twice the protein of regular yoghurt.",
  },
  {
    id: "d3",
    name: "Aged Cheddar Cheese Block",
    category: "Dairy",
    originalPrice: 7.99,
    unit: "500g block",
    stockDate: dateOffset(-7),
    expiryDate: dateOffset(14),
    brand: "Bega Vintage",
    imageUrl:
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80",
    ingredients: "Pasteurised Milk, Salt, Cultures, Non-Animal Rennet",
    nutriscore: "D",
    barcode: "9312345678912",
    description:
      "Sharp, rich vintage cheddar cheese matured for 12 months. Great for cheese boards, melting, or gourmet sandwiches.",
  },

  // ── Meat ────────────────────────────────────────────
  {
    id: "m1",
    name: "Free Range Chicken Breast",
    category: "Meat",
    originalPrice: 12.99,
    unit: "kg",
    stockDate: dateOffset(-2),
    expiryDate: dateOffset(1),
    brand: "Lilydale Free Range",
    imageUrl:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
    ingredients: "100% Australian Free Range Skinless Chicken Breast",
    nutriscore: "A",
    barcode: "9312345678913",
    description:
      "Tender, high-protein free-range chicken breast fillets. No added hormones or antibiotics.",
  },
  {
    id: "m2",
    name: "Premium Lean Beef Mince",
    category: "Meat",
    originalPrice: 14.99,
    unit: "500g pack",
    stockDate: dateOffset(-1),
    expiryDate: dateOffset(3),
    brand: "Grassland Beef",
    imageUrl:
      "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80",
    ingredients: "90% Lean Australian Beef Mince",
    nutriscore: "B",
    barcode: "9312345678914",
    description:
      "100% Australian grass-fed lean beef mince. Perfect for homemade spaghetti bolognese, burger patties, or tacos.",
  },

  // ── Bakery ──────────────────────────────────────────
  {
    id: "b1",
    name: "Artisan Sourdough Loaf",
    category: "Bakery",
    originalPrice: 6.49,
    unit: "loaf",
    stockDate: dateOffset(-2),
    expiryDate: dateOffset(1),
    brand: "Bakers Delight",
    imageUrl:
      "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=600&q=80",
    ingredients: "Unbleached Wheat Flour, Water, Wild Sourdough Starter, Sea Salt",
    nutriscore: "A",
    barcode: "9312345678915",
    description:
      "Crusty European-style sourdough loaf fermented naturally for 24 hours. Features a soft, airy crumb and signature tangy flavor.",
  },
  {
    id: "b2",
    name: "All-Butter French Croissants",
    category: "Bakery",
    originalPrice: 5.99,
    unit: "4-pack",
    stockDate: dateOffset(-1),
    expiryDate: dateOffset(2),
    brand: "La Parisienne",
    imageUrl:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    ingredients: "Wheat Flour, Pure Butter (28%), Water, Sugar, Yeast, Eggs, Salt",
    nutriscore: "C",
    barcode: "9312345678916",
    description:
      "Golden, flaky golden croissants layered with rich creamery butter. Warm gently in the oven for an authentic French breakfast.",
  },

  // ── Seafood ─────────────────────────────────────────
  {
    id: "s1",
    name: "Fresh Atlantic Salmon Fillet",
    category: "Seafood",
    originalPrice: 29.99,
    unit: "kg",
    stockDate: dateOffset(-1),
    expiryDate: dateOffset(2),
    brand: "Tassal Tasmanian Salmon",
    imageUrl:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    ingredients: "100% Skin-on Atlantic Salmon Fillet",
    nutriscore: "A",
    barcode: "9312345678917",
    description:
      "Sustainably farmed Tasmanian Atlantic salmon fillet rich in Omega-3 fatty acids. Crisp skin pan-seared or oven-baked.",
  },
  {
    id: "s2",
    name: "Wild Caught Tiger Prawns",
    category: "Seafood",
    originalPrice: 24.99,
    unit: "kg",
    stockDate: dateOffset(-2),
    expiryDate: dateOffset(1),
    brand: "Ocean Catch Australia",
    imageUrl:
      "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80",
    ingredients: "Cooked Ocean Tiger Prawns, Sea Salt",
    nutriscore: "A",
    barcode: "9312345678918",
    description:
      "Sweet, juicy wild-caught Australian tiger prawns. Pre-cooked and ready to serve with lemon and seafood cocktail sauce.",
  },
];
