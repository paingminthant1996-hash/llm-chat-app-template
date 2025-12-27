import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Configure for large file uploads
export const maxDuration = 180; // 180 seconds (3 minutes) for large file uploads
export const runtime = "nodejs"; // Use Node.js runtime for file handling

// Initialize Supabase admin client
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
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Files are now uploaded directly from the client to Supabase Storage
// This bypasses Vercel's 4.5MB request body limit
// The API route only receives URLs, not file data

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get form data
    const title = formData.get("title") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const version = formData.get("version") as string || "1.0.0";
    const demoUrl = formData.get("demoUrl") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const zipUrl = formData.get("zipUrl") as string;
    const techStackJson = formData.get("techStack") as string;
    const licenseType = formData.get("licenseType") as string;
    const licenseSummary = formData.get("licenseSummary") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDescription = formData.get("metaDescription") as string;
    const keywords = formData.get("keywords") as string;

    // Validate required fields
    if (!title || !shortDescription || !description || !price || !imageUrl || !zipUrl) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid price" },
        { status: 400 }
      );
    }

    // Initialize Supabase admin client
    const supabase = getSupabaseAdmin();

    // Generate slug
    let slug = generateSlug(title);
    let slugSuffix = 1;

    // Check if slug already exists
    const { data: existingTemplate } = await supabase
      .from("templates")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (existingTemplate) {
      slug = `${slug}-${slugSuffix}`;
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

    // Files are already uploaded to Supabase Storage by the client
    // We just use the URLs that were passed in

    // Parse tech stack
    let techStack: string[] = [];
    try {
      const techStackData = JSON.parse(techStackJson || "{}");
      techStack = [
        ...(techStackData.framework || []),
        techStackData.language,
        techStackData.styling,
      ].filter(Boolean);
    } catch {
      techStack = [];
    }

    // Prepare template data
    const templateData: any = {
      slug,
      title,
      description,
      short_description: shortDescription.substring(0, 500),
      price,
      category,
      preview_image_url: imageUrl,
      demo_url: demoUrl || null,
      featured: status === "public",
      screenshot_urls: [imageUrl],
      tech_stack: techStack,
      features: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add optional fields
    try {
      templateData.version = version;
      templateData.status = status;
      templateData.download_url = zipUrl;
      templateData.license_type = licenseType;
      templateData.license_summary = licenseSummary;
      templateData.meta_title = metaTitle || title;
      templateData.meta_description = metaDescription || shortDescription;
      templateData.keywords = keywords ? keywords.split(",").map((k: string) => k.trim()) : [];
    } catch (e) {
      console.log("Some optional fields may not be saved");
    }

    // Insert template into database
    const { data: template, error: insertError } = await supabase
      .from("templates")
      .insert(templateData)
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: `Failed to create template: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Revalidate templates page to show new template
    revalidatePath("/templates");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        slug: template.slug,
        title: template.title,
      },
    });
  } catch (error: any) {
    console.error("Upload template error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

