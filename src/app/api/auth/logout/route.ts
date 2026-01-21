// /api/auth/logout - Clear session
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Delete all auth cookies
    cookieStore.delete("shopify_customer_token");
    cookieStore.delete("customer_email");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    // Still try to delete cookies
    const cookieStore = await cookies();
    cookieStore.delete("shopify_customer_token");
    cookieStore.delete("customer_email");
    return NextResponse.json({ success: true });
  }
}