// /api/auth/logout/callback - Callback after Shopify logout
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function GET() {
  const cookieStore = await cookies();
  
  // Clear all session and OAuth cookies
  cookieStore.delete("shopify_customer_token");
  cookieStore.delete("customer_email");
  cookieStore.delete("shopify_oauth_state");
  cookieStore.delete("shopify_oauth_nonce");
  cookieStore.delete("shopify_oauth_code_verifier");
  cookieStore.delete("shopify_oauth_return_url");

  if (!APP_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL not set" }, { status: 500 });
  }

  // Redirect to home page
  return NextResponse.redirect(new URL("/", APP_URL));
}
