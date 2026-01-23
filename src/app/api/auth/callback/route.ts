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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL not set");
  }
  const redirectUri = new URL("/api/auth/callback", baseUrl).toString();
  
  // Parse the base URL to get the origin for redirects
  const baseUrlObj = new URL(baseUrl);
  const appOrigin = baseUrlObj.origin;
  
  console.log("[auth/callback] Using redirect URI:", redirectUri);
  console.log("[auth/callback] Base URL from env:", baseUrl);
  console.log("[auth/callback] App origin for redirects:", appOrigin);

  try {
    const oauthError = req.nextUrl.searchParams.get("error");
    const oauthErrorDesc = req.nextUrl.searchParams.get("error_description");
    if (oauthError) {
      const msg = oauthErrorDesc || oauthError;
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(msg)}`, appOrigin)
      );
    }

    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("missing_code_or_state")}`, appOrigin)
      );
    }

    const expectedState = cookieStore.get("shopify_oauth_state")?.value;
    const codeVerifier = cookieStore.get("shopify_oauth_code_verifier")?.value;
    if (!expectedState || expectedState !== state) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("invalid_state")}`, appOrigin)
      );
    }
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("missing_code_verifier")}`, appOrigin)
      );
    }

    // Use exact env var from .env.local
    const shopDomainRaw = process.env.SHOPIFY_STORE_DOMAIN;
    if (!shopDomainRaw) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("missing_shop_domain")}`, appOrigin)
      );
    }
    // Clean domain (remove protocol if present)
    const shopDomain = shopDomainRaw.replace(/^https?:\/\//, "").split("/")[0];

    // Use SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID from .env.local
    const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET || "";
    if (!clientId) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("missing_client_id")}`, appOrigin)
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
      "origin": appOrigin,
      "user-agent": req.headers.get("user-agent") || "Mozilla/5.0 (compatible; Next.js)",
    };

    // Confidential client (recommended if you have a secret)
    if (clientSecret) {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    console.log("[auth/callback] Token exchange request", {
      token_endpoint: config.token_endpoint,
      redirect_uri: redirectUri,
      origin: appOrigin,
      has_client_secret: !!clientSecret,
    });

    const tokenRes = await fetch(config.token_endpoint, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text().catch(() => "");
      const errorDetails = {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        body: text?.slice(0, 500),
        headers: Object.fromEntries(tokenRes.headers.entries()),
      };
      console.error("[auth/callback] token exchange failed", errorDetails);
      
      // Try to parse error message from response
      let errorMessage = "token_exchange_failed";
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.error) {
          errorMessage = errorJson.error;
          if (errorJson.error_description) {
            errorMessage += `: ${errorJson.error_description}`;
          }
        }
      } catch {
        // If not JSON, use the text directly if it's short enough
        if (text && text.length < 100) {
          errorMessage = text;
        }
      }
      
      return NextResponse.redirect(
        new URL(
          `/?error=${encodeURIComponent(errorMessage)}`,
          appOrigin
        )
      );
    }

    const tokenJson = (await tokenRes.json()) as TokenResponse;
    if (!tokenJson.access_token) {
      return NextResponse.redirect(
        new URL(
          `/?error=${encodeURIComponent("missing_access_token")}`,
          appOrigin
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

    // Get return URL from cookie if available, otherwise use home page
    const returnUrl = cookieStore.get("shopify_oauth_return_url")?.value || "/";
    
    // Clear temporary cookies
    cookieStore.delete("shopify_oauth_state");
    cookieStore.delete("shopify_oauth_nonce");
    cookieStore.delete("shopify_oauth_code_verifier");
    cookieStore.delete("shopify_oauth_return_url");

    const res = NextResponse.redirect(new URL(returnUrl, appOrigin));
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
        appOrigin
      )
    );
  }
}
