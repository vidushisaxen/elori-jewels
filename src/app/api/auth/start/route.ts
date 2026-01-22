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

export async function GET(req: NextRequest) {
  try {
    // Use exact env var from .env.local
    const shopDomainRaw = process.env.SHOPIFY_STORE_DOMAIN;
    if (!shopDomainRaw) {
      return NextResponse.json(
        { ok: false, error: "Missing SHOPIFY_STORE_DOMAIN" },
        { status: 500 }
      );
    }
    // Clean domain (remove protocol if present)
    const shopDomain = shopDomainRaw.replace(/^https?:\/\//, "").split("/")[0];

    // Use SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID from .env.local
    const clientId = "304443fe-ec2e-4614-8936-a222a5150f33";
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "Missing SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID" },
        { status: 500 }
      );
    }

    const returnUrl = req.nextUrl.searchParams.get("returnUrl") || "/";
    const prompt = req.nextUrl.searchParams.get("prompt") || undefined;
    const locale = req.nextUrl.searchParams.get("locale") || undefined;
    const loginHint = req.nextUrl.searchParams.get("login_hint") || undefined;

    // IMPORTANT: Must match exactly one of the Redirect URIs configured in Shopify app settings
    const redirectUri = `http://localhost:3000/api/auth/callback`;

    // PKCE + CSRF
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const codeVerifier = base64Url(crypto.randomBytes(32));
    const codeChallenge = sha256Base64Url(codeVerifier);

    // Step 1: Fetch the OpenID configuration
    const discoveryRes = await fetch(
      `https://${shopDomain}/.well-known/openid-configuration`
    );
    const discovery = await discoveryRes.json();

    // Step 2: Extract the authorization endpoint
    const authorizationEndpoint = discovery.authorization_endpoint;

    // Step 3: Redirect user to that endpoint with query params
    const authUrl = new URL(authorizationEndpoint);
    authUrl.searchParams.set(
      "scope",
      "openid email customer-account-api:full"
    );
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

    console.log("[auth/start] Redirecting to:", authUrl.toString());
    console.log("[auth/start] Redirect URI:", redirectUri);

    return NextResponse.redirect(authUrl.toString());
  } catch (e) {
    console.error("[auth/start] error", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to start auth" },
      { status: 500 }
    );
  }
}
