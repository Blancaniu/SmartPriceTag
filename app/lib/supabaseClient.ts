import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { FoodItem } from "@/app/data/foodData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY"
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * LocalStorage keys for demo / offline mode
 */
const DEMO_USER_KEY = "smartpricetag_user_session";
const DEMO_REGISTRY_KEY = "smartpricetag_registered_users";
const DEMO_PRODUCTS_KEY = "smartpricetag_custom_products";

export type AccountType = "personal" | "business";

export interface UserSession {
  accountType: AccountType;
  email: string;
  id: string;
  createdAt: string;
}

/** Stored user record in the local registry (demo mode) */
interface RegisteredUser {
  accountType: AccountType;
  email: string;
  passwordHash: string; // simple hash for demo only — NOT production-grade
  id: string;
  createdAt: string;
}

/**
 * Simple string hash for demo-mode password comparison.
 * This is NOT cryptographically secure — it's only for local demo UX.
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return `demo_${hash.toString(36)}`;
}

/** Read the local user registry */
function getRegistry(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(DEMO_REGISTRY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RegisteredUser[];
  } catch {
    return [];
  }
}

/** Save the local user registry */
function saveRegistry(registry: RegisteredUser[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_REGISTRY_KEY, JSON.stringify(registry));
  }
}

// ─── Login ────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  pass: string
): Promise<{ user: UserSession | null; error: string | null }> {
  // ── Supabase live mode ──
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) return { user: null, error: error.message };
    if (data.user) {
      const session: UserSession = {
        email: data.user.email || email,
        id: data.user.id,
        createdAt: data.user.created_at,
        accountType: data.user.user_metadata?.account_type === "business" ? "business" : "personal",
      };
      // Also persist to localStorage so getCurrentSession() works across pages
      if (typeof window !== "undefined") {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(session));
      }
      return { user: session, error: null };
    }
    return { user: null, error: "Login failed. Please try again." };
  }

  // ── Demo Fallback Mode ──
  // Only allow login for previously registered demo accounts
  const registry = getRegistry();
  const existing = registry.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!existing) {
    return {
      user: null,
      error: "No account found with this email. Please create an account first.",
    };
  }

  if (existing.passwordHash !== simpleHash(pass)) {
    return { user: null, error: "Incorrect password. Please try again." };
  }

  const session: UserSession = {
    email: existing.email,
    id: existing.id,
    createdAt: existing.createdAt,
    accountType: existing.accountType || "personal",
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(session));
  }
  return { user: session, error: null };
}

// ─── Sign Up ──────────────────────────────────────────────────────

export async function signUpUser(
  email: string,
  pass: string,
  accountType: AccountType = "personal"
): Promise<{ user: UserSession | null; error: string | null; needsVerification?: boolean }> {
  if (pass.length < 6) {
    return { user: null, error: "Password must be at least 6 characters." };
  }

  // ── Supabase live mode ──
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      options: { data: { account_type: accountType } },
      email,
      password: pass,
    });
    if (error) return { user: null, error: error.message };

    if (data.user) {
      // Supabase returns a user object even when email confirmation is required.
      // Check if the user has confirmed identities — if not, they need to verify.
      const hasIdentities =
        data.user.identities && data.user.identities.length > 0;

      if (!hasIdentities) {
        // User already exists (Supabase returns empty identities for duplicate signups)
        return {
          user: null,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }

      // Check if email confirmation is pending
      if (data.user.confirmation_sent_at && !data.user.email_confirmed_at) {
        return {
          user: null,
          error: null,
          needsVerification: true,
        };
      }

      const session: UserSession = {
        email: data.user.email || email,
        id: data.user.id,
        createdAt: data.user.created_at,
        accountType: data.user.user_metadata?.account_type === "business" ? "business" : "personal",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(session));
      }
      return { user: session, error: null };
    }
    return { user: null, error: "Sign up failed. Please try again." };
  }

  // ── Demo Fallback Mode ──
  const registry = getRegistry();
  const alreadyExists = registry.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (alreadyExists) {
    return {
      user: null,
      error: "An account with this email already exists. Please sign in instead.",
    };
  }

  const newUser: RegisteredUser = {
    accountType,
    email,
    passwordHash: simpleHash(pass),
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  registry.push(newUser);
  saveRegistry(registry);

  const session: UserSession = {
    email: newUser.email,
    id: newUser.id,
    createdAt: newUser.createdAt,
    accountType: newUser.accountType,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(session));
  }
  return { user: session, error: null };
}

// ─── Logout ───────────────────────────────────────────────────────

export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_USER_KEY);
  }
}

// ─── Session ──────────────────────────────────────────────────────

export function getCurrentSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (!stored) return null;
  try {
    const session = JSON.parse(stored) as UserSession;
    return { ...session, accountType: session.accountType || "personal" };
  } catch {
    return null;
  }
}

// ─── Products (Supabase + localStorage fallback) ──────────────────

/**
 * Inserts a new user product into Supabase (or local storage fallback)
 */
export async function saveProduct(
  item: Omit<FoodItem, "id">
): Promise<{ success: boolean; id: string; error?: string }> {
  const session = await resolveCurrentSession();
  if (session?.accountType !== "business") {
    return { success: false, id: "", error: "Sign in with a business account to add products." };
  }
  const newId = `user-prod-${Date.now()}`;
  const fullItem: FoodItem = {
    ...item,
    id: newId,
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("products").insert([
      {
        id: newId,
        name: item.name,
        category: item.category,
        original_price: item.originalPrice,
        unit: item.unit,
        stock_date: item.stockDate,
        expiry_date: item.expiryDate,
        image_url: item.imageUrl,
        brand: item.brand,
        ingredients: item.ingredients,
        nutriscore: item.nutriscore,
        barcode: item.barcode,
        description: item.description,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      // Fall through to save locally if table doesn't exist yet
    } else {
      return { success: true, id: newId };
    }
  }

  // Save to LocalStorage fallback
  if (typeof window !== "undefined") {
    const existingStr = localStorage.getItem(DEMO_PRODUCTS_KEY);
    const existing: FoodItem[] = existingStr ? JSON.parse(existingStr) : [];
    existing.unshift(fullItem);
    localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(existing));
  }

  return { success: true, id: newId };
}

/**
 * Gets user uploaded products from Supabase (or local storage fallback)
 */
export async function getCustomProducts(): Promise<FoodItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          originalPrice: d.original_price,
          unit: d.unit,
          stockDate: d.stock_date,
          expiryDate: d.expiry_date,
          imageUrl: d.image_url,
          brand: d.brand,
          ingredients: d.ingredients,
          nutriscore: d.nutriscore,
          barcode: d.barcode,
          description: d.description,
        }));
      }
    } catch (e) {
      console.warn("Could not query Supabase products table:", e);
    }
  }

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(DEMO_PRODUCTS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as FoodItem[];
      } catch {
        return [];
      }
    }
  }

  return [];
}

/** Validate live sessions with Supabase rather than trusting the local cache. */
export async function resolveCurrentSession(): Promise<UserSession | null> {
  if (!supabase) return getCurrentSession();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email || "",
    createdAt: data.user.created_at,
    accountType: data.user.user_metadata?.account_type === "business" ? "business" : "personal",
  };
}
