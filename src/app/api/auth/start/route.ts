import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

function base64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sha256Base64Url(str: string) {
  return base64Url(crypto.createHash("sha256").update(str).digest());
}

async function discover(shopDomain: string) {
  const res = await fetch(`https://${shopDomain}/.well-known/openid-configuration`, {
    // discovery changes rarely; keep default caching semantics
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `OpenID discovery failed (${res.status}) ${text?.slice(0, 200)}`.trim()
    );
  }
  return (await res.json()) as {
    authorization_endpoint: string;
    token_endpoint: string;
    end_session_endpoint?: string;
    jwks_uri?: string;
    issuer?: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const shopDomainRaw =
      process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_ID || "";
    const shopDomain = shopDomainRaw.replace(/^https?:\/\//, "").split("/")[0];
    if (!shopDomain) {
      return NextResponse.json(
        { ok: false, error: "Missing SHOPIFY_STORE_DOMAIN" },
        { status: 500 }
      );
    }

    const clientId =
      process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID ||
      process.env.SHOPIFY_CLIENT_ID ||
      "";
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "Missing SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID (or SHOPIFY_CLIENT_ID)" },
        { status: 500 }
      );
    }

    const returnUrl = req.nextUrl.searchParams.get("returnUrl") || "/";
    const prompt = req.nextUrl.searchParams.get("prompt") || undefined;
    const locale = req.nextUrl.searchParams.get("locale") || undefined;
    const loginHint = req.nextUrl.searchParams.get("login_hint") || undefined;

    const config = await discover(shopDomain);

    // IMPORTANT: Must match exactly one of the Redirect URIs configured in Shopify app settings
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const redirectUri = new URL("/api/auth/callback", baseUrl).toString();

    // PKCE + CSRF
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const codeVerifier = base64Url(crypto.randomBytes(32));
    const codeChallenge = sha256Base64Url(codeVerifier);

    const authUrl = new URL(config.authorization_endpoint);
    authUrl.searchParams.set("scope", "openid email customer-account-api:full");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("nonce", nonce);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    if (prompt) authUrl.searchParams.set("prompt", prompt);
    if (locale) authUrl.searchParams.set("locale", locale);
    if (loginHint) authUrl.searchParams.set("login_hint", loginHint);

    const cookieStore = await cookies();
    cookieStore.set("shopify_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutes
      path: "/",
    });
    cookieStore.set("shopify_oauth_nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    });
    cookieStore.set("shopify_oauth_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    });
    cookieStore.set("shopify_oauth_return_url", returnUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    });

    return NextResponse.redirect(authUrl.toString());
  } catch (e) {
    console.error("[auth/start] error", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to start auth" },
      { status: 500 }
    );
  }
}
