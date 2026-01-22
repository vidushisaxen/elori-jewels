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
    const shopDomainRaw = process.env.SHOPIFY_STORE_DOMAIN;
    if (!shopDomainRaw) {
      return NextResponse.json(
        { ok: false, error: "Missing SHOPIFY_STORE_DOMAIN" },
        { status: 500 }
      );
    }
    const shopDomain = shopDomainRaw.replace(/^https?:\/\//, "").split("/")[0];

    const clientId = process.env.SHOPIFY_CLIENT_ID;
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing NEXT_PUBLIC_APP_URL" },
        { status: 500 }
      );
    }
    const redirectUri = new URL("/api/auth/callback", baseUrl).toString();

    // PKCE + CSRF
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const codeVerifier = base64Url(crypto.randomBytes(32));
    const codeChallenge = sha256Base64Url(codeVerifier);

    // First, discover the authentication endpoints
    const discoveryResponse = await fetch(
      `https://${shopDomain}/.well-known/openid-configuration`
    );
    const config = await discoveryResponse.json();

    const authorizationRequestUrl = new URL(config.authorization_endpoint);
    authorizationRequestUrl.searchParams.append(
      "scope",
      "openid email customer-account-api:full"
    );
    authorizationRequestUrl.searchParams.append("client_id", clientId);
    authorizationRequestUrl.searchParams.append("response_type", "code");
    authorizationRequestUrl.searchParams.append("redirect_uri", redirectUri);
    authorizationRequestUrl.searchParams.append("state", state);
    authorizationRequestUrl.searchParams.append("nonce", nonce);
    authorizationRequestUrl.searchParams.append("code_challenge", codeChallenge);
    authorizationRequestUrl.searchParams.append("code_challenge_method", "S256");
    if (prompt) authorizationRequestUrl.searchParams.append("prompt", prompt);
    if (locale) authorizationRequestUrl.searchParams.append("locale", locale);
    if (loginHint) authorizationRequestUrl.searchParams.append("login_hint", loginHint);

    const cookieStore = await cookies();
    cookieStore.set("shopify_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
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

    return NextResponse.redirect(authorizationRequestUrl.toString());
  } catch (e) {
    console.error("[auth/start] error", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Failed to start auth" },
      { status: 500 }
    );
  }
}
