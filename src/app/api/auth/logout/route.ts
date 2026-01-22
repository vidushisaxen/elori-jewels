// /api/auth/logout - Logout using Shopify end_session_endpoint
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

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Get the ID token from the session cookie
    const sessionCookie = cookieStore.get("shopify_customer_token")?.value;
    let idToken: string | undefined;

    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(Buffer.from(sessionCookie, "base64").toString());
        idToken = sessionData.idToken;
      } catch (e) {
        console.error("[auth/logout] Failed to parse session cookie", e);
      }
    }

    // Get shop domain
    const shopDomainRaw = process.env.SHOPIFY_STORE_DOMAIN;
    if (!shopDomainRaw) {
      console.error("[auth/logout] Missing SHOPIFY_STORE_DOMAIN");
      // Clear cookies and return success
      cookieStore.delete("shopify_customer_token");
      cookieStore.delete("customer_email");
      cookieStore.delete("shopify_oauth_state");
      cookieStore.delete("shopify_oauth_nonce");
      cookieStore.delete("shopify_oauth_code_verifier");
      cookieStore.delete("shopify_oauth_return_url");
      return NextResponse.json({ success: true, logoutUrl: null });
    }

    const shopDomain = shopDomainRaw.replace(/^https?:\/\//, "").split("/")[0];

    // Discover the end_session_endpoint
    const config = await discover(shopDomain);

    if (config.end_session_endpoint && idToken) {
      // Build the logout URL with id_token_hint and post_logout_redirect_uri
      const logoutUrl = new URL(config.end_session_endpoint);
      logoutUrl.searchParams.set("id_token_hint", idToken);
      // Redirect back to homepage after logout
      logoutUrl.searchParams.set("post_logout_redirect_uri", `${req.nextUrl.origin}/`);

      console.log("[auth/logout] Logout URL:", logoutUrl.toString());
      
      // Return the logout URL - client will redirect to it
      return NextResponse.json({ 
        success: true, 
        logoutUrl: logoutUrl.toString() 
      });
    } else {
      // Fallback: clear cookies if no end_session_endpoint or id_token
      console.log("[auth/logout] No end_session_endpoint or id_token, clearing cookies");
      cookieStore.delete("shopify_customer_token");
      cookieStore.delete("customer_email");
      cookieStore.delete("shopify_oauth_state");
      cookieStore.delete("shopify_oauth_nonce");
      cookieStore.delete("shopify_oauth_code_verifier");
      cookieStore.delete("shopify_oauth_return_url");
      return NextResponse.json({ success: true, logoutUrl: null });
    }
  } catch (error) {
    console.error("[auth/logout] error", error);
    // Still try to delete cookies
    try {
      const cookieStore = await cookies();
      cookieStore.delete("shopify_customer_token");
      cookieStore.delete("customer_email");
      cookieStore.delete("shopify_oauth_state");
      cookieStore.delete("shopify_oauth_nonce");
      cookieStore.delete("shopify_oauth_code_verifier");
      cookieStore.delete("shopify_oauth_return_url");
    } catch (e) {
      console.error("[auth/logout] Failed to delete cookies", e);
    }
    return NextResponse.json({ success: true, logoutUrl: null });
  }
}