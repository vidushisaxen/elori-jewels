import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function discover(shopDomain: string) {
  const res = await fetch(`https://${shopDomain}/.well-known/openid-configuration`);
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

type TokenResponse = {
  access_token: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
};

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const redirectUri = new URL("/api/auth/callback", baseUrl).toString();

  const returnUrl = cookieStore.get("shopify_oauth_return_url")?.value || "/";

  try {
    const oauthError = req.nextUrl.searchParams.get("error");
    const oauthErrorDesc = req.nextUrl.searchParams.get("error_description");
    if (oauthError) {
      const msg = oauthErrorDesc || oauthError;
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(msg)}`, req.nextUrl.origin)
      );
    }

    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("missing_code_or_state")}`, req.nextUrl.origin)
      );
    }

    const expectedState = cookieStore.get("shopify_oauth_state")?.value;
    const codeVerifier = cookieStore.get("shopify_oauth_code_verifier")?.value;
    if (!expectedState || expectedState !== state) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("invalid_state")}`, req.nextUrl.origin)
      );
    }
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("missing_code_verifier")}`, req.nextUrl.origin)
      );
    }

    // Use exact env var from .env.local
    const shopDomainRaw = process.env.SHOPIFY_STORE_DOMAIN;
    if (!shopDomainRaw) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("missing_shop_domain")}`, req.nextUrl.origin)
      );
    }
    // Clean domain (remove protocol if present)
    const shopDomain = shopDomainRaw.replace(/^https?:\/\//, "").split("/")[0];

    // Use SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID from .env.local
    const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET || "";
    if (!clientId) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("missing_client_id")}`, req.nextUrl.origin)
      );
    }

    const config = await discover(shopDomain);

    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("client_id", clientId);
    body.set("redirect_uri", redirectUri);
    body.set("code", code);
    body.set("code_verifier", codeVerifier);

    const headers: Record<string, string> = {
      "content-type": "application/x-www-form-urlencoded",
    };

    // Confidential client (recommended if you have a secret)
    if (clientSecret) {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    const tokenRes = await fetch(config.token_endpoint, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text().catch(() => "");
      console.error("[auth/callback] token exchange failed", {
        status: tokenRes.status,
        body: text?.slice(0, 500),
      });
      return NextResponse.redirect(
        new URL(
          `/?error=${encodeURIComponent("token_exchange_failed")}`,
          req.nextUrl.origin
        )
      );
    }

    const tokenJson = (await tokenRes.json()) as TokenResponse;
    if (!tokenJson.access_token) {
      return NextResponse.redirect(
        new URL(
          `/?error=${encodeURIComponent("missing_access_token")}`,
          req.nextUrl.origin
        )
      );
    }

    const expiresIn = tokenJson.expires_in ?? 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    const sessionPayload = {
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token,
      idToken: tokenJson.id_token,
      expiresAt,
      // customer will be resolved by /api/auth/session
      customer: { id: "unknown" },
    };
    const encoded = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    // Clear temporary cookies
    cookieStore.delete("shopify_oauth_state");
    cookieStore.delete("shopify_oauth_nonce");
    cookieStore.delete("shopify_oauth_code_verifier");
    cookieStore.delete("shopify_oauth_return_url");

    const res = NextResponse.redirect(new URL(returnUrl, req.nextUrl.origin));
    res.cookies.set("shopify_customer_token", encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });

    return res;
  } catch (e) {
    console.error("[auth/callback] error", e);
    // best-effort cleanup to avoid sticky invalid cookies
    cookieStore.delete("shopify_oauth_state");
    cookieStore.delete("shopify_oauth_nonce");
    cookieStore.delete("shopify_oauth_code_verifier");
    cookieStore.delete("shopify_oauth_return_url");
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(e instanceof Error ? e.message : "auth_failed")}`,
        req.nextUrl.origin
      )
    );
  }
}

