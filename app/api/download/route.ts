// app/api/download/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const STORAGE_BUCKET = "template-sources";
const SIGN_URL_EXPIRE_SECONDS = 120;

// Helper to get env vars (will be checked at runtime, not build time)
const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    throw new Error("Missing SUPABASE env in Next.js server route");
  }

  return { url, anonKey, serviceKey };
};

// utility: call RPC user_has_access_to_version with user's JWT
async function rpcUserHasAccess(versionId: string, userJwt: string): Promise<boolean> {
  const config = getSupabaseConfig();
  const rpcUrl = `${config.url}/rest/v1/rpc/user_has_access_to_version`;
  const body = { p_version_id: versionId };
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": config.anonKey,
      "Authorization": `Bearer ${userJwt}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("RPC user_has_access failed:", res.status, text);
    return false;
  }
  const json = await res.json().catch(() => []);
  if (Array.isArray(json) && json.length > 0) return Boolean(json[0]);
  return false;
}

// utility: get source_path of version
async function getSourcePath(versionId: string): Promise<string | null> {
  const config = getSupabaseConfig();
  const url = `${config.url}/rest/v1/template_versions?id=eq.${encodeURIComponent(versionId)}&select=source_path`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "apikey": config.anonKey,
      "Authorization": `Bearer ${config.anonKey}`,
    },
  });
  if (!res.ok) {
    console.error("Failed fetch template_versions:", res.status, await res.text().catch(() => ""));
    return null;
  }
  const json = await res.json().catch(() => null);
  if (Array.isArray(json) && json.length > 0) {
    return (json[0] as any).source_path ?? null;
  }
  return null;
}

// utility: create signed url via storage REST with service role
async function createSignedUrl(bucketId: string, objectKey: string, expiresInSec = SIGN_URL_EXPIRE_SECONDS) {
  const config = getSupabaseConfig();
  const url = `${config.url}/storage/v1/object/sign/${encodeURIComponent(bucketId)}/${encodeURIComponent(objectKey)}?expiry=${expiresInSec}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": config.serviceKey,
      "Authorization": `Bearer ${config.serviceKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    console.error("Failed createSignedUrl:", res.status, await res.text().catch(() => ""));
    return null;
  }
  const json = await res.json().catch(() => null);
  return json;
}

export async function GET(req: NextRequest) {
  try {
    // Check env vars at runtime (not build time)
    getSupabaseConfig();

    const url = new URL(req.url);
    const versionId = url.searchParams.get("version_id");
    if (!versionId) {
      return NextResponse.json({ error: "version_id_required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
    }
    const userJwt = authHeader.split(" ")[1];

    // Check access via RPC (user's JWT)
    const hasAccess = await rpcUserHasAccess(versionId, userJwt);
    if (!hasAccess) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const sourcePath = await getSourcePath(versionId);
    if (!sourcePath) {
      return NextResponse.json({ error: "source_not_found" }, { status: 404 });
    }

    const signed = await createSignedUrl(STORAGE_BUCKET, sourcePath, SIGN_URL_EXPIRE_SECONDS);
    if (!signed) {
      return NextResponse.json({ error: "signed_url_failed" }, { status: 500 });
    }

    const urlResp = (signed as any).signedURL ?? (signed as any).signed_url ?? signed;

    return NextResponse.json({ url: urlResp, expires_in: SIGN_URL_EXPIRE_SECONDS }, { status: 200 });
  } catch (err: any) {
    console.error("app/api/download error:", err);
    if (err.message?.includes("Missing SUPABASE")) {
      return NextResponse.json({ error: "server_configuration_error" }, { status: 500 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// For POST support (optional)
export async function POST(req: NextRequest) {
  try {
    // Check env vars at runtime (not build time)
    getSupabaseConfig();

    const body = await req.json();
    const versionId = body?.version_id ?? null;
    if (!versionId) return NextResponse.json({ error: "version_id_required" }, { status: 400 });

    const authHeader = req.headers.get("authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
    }
    const userJwt = authHeader.split(" ")[1];

    const hasAccess = await rpcUserHasAccess(versionId, userJwt);
    if (!hasAccess) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const sourcePath = await getSourcePath(versionId);
    if (!sourcePath) return NextResponse.json({ error: "source_not_found" }, { status: 404 });

    const signed = await createSignedUrl(STORAGE_BUCKET, sourcePath, SIGN_URL_EXPIRE_SECONDS);
    if (!signed) return NextResponse.json({ error: "signed_url_failed" }, { status: 500 });

    const urlResp = (signed as any).signedURL ?? (signed as any).signed_url ?? signed;
    return NextResponse.json({ url: urlResp, expires_in: SIGN_URL_EXPIRE_SECONDS }, { status: 200 });
  } catch (err: any) {
    console.error("app/api/download POST error:", err);
    if (err.message?.includes("Missing SUPABASE")) {
      return NextResponse.json({ error: "server_configuration_error" }, { status: 500 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

