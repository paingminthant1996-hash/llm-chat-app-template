// Purchase query functions for Supabase
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./supabase";

// Get Supabase admin client for purchases
function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Purchase interface with joined data
export interface PurchaseWithDetails {
  id: string;
  user_id: string;
  template_version_id: string;
  price: number;
  currency: string;
  stripe_payment_intent: string | null;
  stripe_session_id: string | null;
  granted: boolean;
  refunded: boolean;
  purchased_at: string;
  expires_at: string | null;
  metadata: any;
  // Joined data
  template?: {
    id: string;
    title: string;
    slug: string;
    category: string;
  };
  template_version?: {
    id: string;
    version: string;
    template_id: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Get all purchases with template and user details
 */
export async function getAllPurchases(): Promise<PurchaseWithDetails[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("purchases_v2")
      .select(`
        *,
        template_version:template_versions(
          id,
          version,
          template_id,
          template:templates(
            id,
            title,
            slug,
            category
          )
        )
      `)
      .order("purchased_at", { ascending: false });

    if (error) {
      console.error("Error fetching purchases:", error);
      return [];
    }

    // Transform data to include template info
    const purchases: PurchaseWithDetails[] = (data || []).map((purchase: any) => {
      const result: PurchaseWithDetails = {
        id: purchase.id,
        user_id: purchase.user_id,
        template_version_id: purchase.template_version_id,
        price: parseFloat(purchase.price),
        currency: purchase.currency || "USD",
        stripe_payment_intent: purchase.stripe_payment_intent,
        stripe_session_id: purchase.stripe_session_id,
        granted: purchase.granted,
        refunded: purchase.refunded,
        purchased_at: purchase.purchased_at,
        expires_at: purchase.expires_at,
        metadata: purchase.metadata,
      };

      // Extract template info from joined data
      if (purchase.template_version) {
        result.template_version = {
          id: purchase.template_version.id,
          version: purchase.template_version.version,
          template_id: purchase.template_version.template_id,
        };

        if (purchase.template_version.template) {
          result.template = purchase.template_version.template;
        }
      }

      // Get user email from metadata or auth.users
      if (purchase.metadata?.customer_email) {
        result.user = {
          id: purchase.user_id,
          email: purchase.metadata.customer_email,
        };
      }

      return result;
    });

    // Fetch user emails from auth.users for purchases without email in metadata
    const userIds = purchases
      .filter((p) => !p.user?.email)
      .map((p) => p.user_id)
      .filter((id, index, self) => self.indexOf(id) === index);

    if (userIds.length > 0) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const userMap = new Map(users?.users.map((u) => [u.id, u.email]) || []);

      purchases.forEach((purchase) => {
        if (!purchase.user?.email && userMap.has(purchase.user_id)) {
          purchase.user = {
            id: purchase.user_id,
            email: userMap.get(purchase.user_id) || "",
          };
        }
      });
    }

    return purchases;
  } catch (error) {
    console.error("Failed to fetch purchases:", error);
    return [];
  }
}

/**
 * Get purchases filtered by date range
 */
export async function getPurchasesByDateRange(
  startDate: string,
  endDate: string
): Promise<PurchaseWithDetails[]> {
  const allPurchases = await getAllPurchases();
  return allPurchases.filter((p) => {
    const purchaseDate = new Date(p.purchased_at);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date
    return purchaseDate >= start && purchaseDate <= end;
  });
}

/**
 * Get purchases filtered by template
 */
export async function getPurchasesByTemplate(
  templateId: string
): Promise<PurchaseWithDetails[]> {
  const allPurchases = await getAllPurchases();
  return allPurchases.filter(
    (p) => p.template_version?.template_id === templateId
  );
}

/**
 * Get purchases filtered by customer email
 */
export async function getPurchasesByEmail(
  email: string
): Promise<PurchaseWithDetails[]> {
  const allPurchases = await getAllPurchases();
  return allPurchases.filter(
    (p) => p.user?.email?.toLowerCase().includes(email.toLowerCase())
  );
}

