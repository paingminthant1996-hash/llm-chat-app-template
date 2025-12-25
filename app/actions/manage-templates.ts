"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Get Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Update template
export async function updateTemplate(
  id: string,
  data: {
    title?: string;
    description?: string;
    short_description?: string;
    price?: number;
    category?: string;
    demo_url?: string;
  }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("templates")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/templates");
    revalidatePath("/templates");
    revalidatePath(`/templates/${data.title ? data.title.toLowerCase().replace(/\s+/g, "-") : ""}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update template" };
  }
}

// Delete template
export async function deleteTemplate(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("templates").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/templates");
    revalidatePath("/templates");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete template" };
  }
}

// Toggle featured status
export async function toggleFeatured(id: string, featured: boolean) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("templates")
      .update({
        featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/templates");
    revalidatePath("/templates");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle featured status" };
  }
}

// Bulk delete templates
export async function bulkDeleteTemplates(ids: string[]) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("templates").delete().in("id", ids);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/templates");
    revalidatePath("/templates");

    return { success: true, deletedCount: ids.length };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete templates" };
  }
}

// Bulk update category
export async function bulkUpdateCategory(ids: string[], category: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("templates")
      .update({
        category,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/templates");
    revalidatePath("/templates");

    return { success: true, updatedCount: ids.length };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" };
  }
}

// Bulk toggle featured
export async function bulkToggleFeatured(ids: string[], featured: boolean) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("templates")
      .update({
        featured,
        updated_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/templates");
    revalidatePath("/templates");
    revalidatePath("/");

    return { success: true, updatedCount: ids.length };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle featured status" };
  }
}

