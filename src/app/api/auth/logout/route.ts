// /api/auth/logout - Logout using Shopify end_session_endpoint
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SHOPIFY_STORE_ID = process.env.SHOPIFY_STORE_ID!; // e.g. "97678459179"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;       // e.g. "https://your-ngrok-url.ngrok-free.dev"

interface SessionData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  idToken?: string;
  customer: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

function parseSessionToken(token: string): SessionData | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString());
  } catch {
    return null;
  }
}

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("shopify_customer_token")?.value;

  // Default response: no remote logout URL, just local cleanup
  const baseJson = { logoutUrl: null as string | null };

  // If no session cookie, just clear and return
  if (!sessionToken) {
    cookieStore.delete("shopify_customer_token");
    cookieStore.delete("customer_email");
    return NextResponse.json(baseJson);
  }

  const session = parseSessionToken(sessionToken);

  if (!session || !session.idToken) {
    // Invalid session or no id_token to give Shopify
    cookieStore.delete("shopify_customer_token");
    cookieStore.delete("customer_email");
    return NextResponse.json(baseJson);
  }

  // Discover OpenID configuration to get end_session_endpoint
  const discoveryResponse = await fetch(
    `https://shopify.com/${SHOPIFY_STORE_ID}/.well-known/openid-configuration`
  );

  if (!discoveryResponse.ok) {
    const text = await discoveryResponse.text();
    console.error("Discovery error during logout", discoveryResponse.status, text);
    // Even if discovery fails, clear local cookies and just do local logout
    cookieStore.delete("shopify_customer_token");
    cookieStore.delete("customer_email");
    return NextResponse.json(baseJson);
  }

  const config = await discoveryResponse.json();
  const endSessionEndpoint = config.end_session_endpoint as string | undefined;

  if (!endSessionEndpoint) {
    console.warn("No end_session_endpoint in discovery config");
    cookieStore.delete("shopify_customer_token");
    cookieStore.delete("customer_email");
    return NextResponse.json(baseJson);
  }

  // Build logout URL that browser will navigate to
  // Shopify will handle logout and then redirect to post_logout_redirect_uri
  const postLogoutRedirectUri = `${APP_URL}/`; // or a dedicated /logged-out page if you want

  const logoutUrl = new URL(endSessionEndpoint);
  logoutUrl.searchParams.set("id_token_hint", session.idToken);
  logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

  // Clear local cookies now so that even if Shopify redirect fails, you're logged out in your app
  cookieStore.delete("shopify_customer_token");
  cookieStore.delete("customer_email");

  return NextResponse.json({
    logoutUrl: logoutUrl.toString(),
  });
}