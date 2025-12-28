import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Upload files using service role key (bypasses RLS)
// Note: Vercel has 4.5MB limit, but we handle it server-side
export const maxDuration = 180; // 3 minutes
export const runtime = "nodejs";

// Initialize Supabase admin client (uses service role key - bypasses RLS)
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;
    const templateSlug = formData.get("templateSlug") as string;

    if (!file || !folder || !templateSlug) {
      return NextResponse.json(
        { error: "Missing required fields: file, folder, or templateSlug" },
        { status: 400 }
      );
    }

    // Check file size (Vercel limit is 4.5MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 4.5) {
      return NextResponse.json(
        { error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds Vercel's 4.5MB limit. Please reduce file size or use a different upload method.` },
        { status: 413 }
      );
    }

    const supabase = getSupabaseAdmin();
    const bucketName = "template-assets";
    const fileExt = file.name.split(".").pop();
    const uniqueFileName = `${templateSlug}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${uniqueFileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage using service role key (bypasses RLS)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json(
        { error: `Failed to upload file: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    if (!publicUrl) {
      return NextResponse.json(
        { error: "Failed to get public URL for uploaded file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

