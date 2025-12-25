"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Supabase client with service role key for admin operations
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Upload image to Supabase Storage
async function uploadImageToStorage(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  file: File,
  templateSlug: string
): Promise<string> {
  const bucketName = "template-assets";
  const fileExt = file.name.split(".").pop();
  const fileName = `${templateSlug}-${Date.now()}.${fileExt}`;
  const filePath = `previews/${fileName}`;

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  if (!publicUrl) {
    throw new Error("Failed to get public URL for uploaded image");
  }

  return publicUrl;
}

// Main server action
export async function uploadTemplate(formData: FormData) {
  try {
    // Get form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const demoUrl = formData.get("demoUrl") as string;
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File;

    // Validate required fields
    if (!title || !description || !price || !imageFile) {
      return { error: "Please fill in all required fields" };
    }

    if (isNaN(price) || price <= 0) {
      return { error: "Please enter a valid price" };
    }

    // Initialize Supabase admin client
    const supabase = getSupabaseAdmin();

    // Generate slug from title
    let slug = generateSlug(title);
    let slugSuffix = 1;

    // Check if slug already exists, append number if needed
    const { data: existingTemplate } = await supabase
      .from("templates")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (existingTemplate) {
      slug = `${slug}-${slugSuffix}`;
      // Keep checking until we find a unique slug
      while (true) {
        const { data: check } = await supabase
          .from("templates")
          .select("slug")
          .eq("slug", slug)
          .single();
        if (!check) break;
        slugSuffix++;
        slug = `${generateSlug(title)}-${slugSuffix}`;
      }
    }

    // Upload image to Supabase Storage
    const imageUrl = await uploadImageToStorage(supabase, imageFile, slug);

    // Insert template into database
    const { data: template, error: insertError } = await supabase
      .from("templates")
      .insert({
        slug,
        title,
        description,
        short_description: description.substring(0, 500), // Auto-generate short description
        price,
        category,
        preview_image_url: imageUrl,
        demo_url: demoUrl || null,
        featured: false,
        screenshot_urls: [imageUrl], // Use preview image as first screenshot
        tech_stack: [],
        features: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return { error: `Failed to create template: ${insertError.message}` };
    }

    // Revalidate templates page to show new template
    revalidatePath("/templates");
    revalidatePath("/");

    return {
      success: true,
      template: {
        id: template.id,
        slug: template.slug,
        title: template.title,
      },
    };
  } catch (error: any) {
    console.error("Upload template error:", error);
    return {
      error: error.message || "An unexpected error occurred. Please try again.",
    };
  }
}

