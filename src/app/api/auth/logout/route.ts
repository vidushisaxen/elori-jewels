import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const customerAccessTokenDeleteMutation = `
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

async function shopifyStorefrontFetch(query: string, variables: Record<string, unknown>) {
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  return response.json();
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("shopify_customer_token")?.value;

    if (accessToken) {
      // Invalidate the token on Shopify's side
      await shopifyStorefrontFetch(customerAccessTokenDeleteMutation, {
        customerAccessToken: accessToken,
      });
    }

    // Delete the cookie
    cookieStore.delete("shopify_customer_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    // Still delete the cookie even if Shopify call fails
    const cookieStore = await cookies();
    cookieStore.delete("shopify_customer_token");
    return NextResponse.json({ success: true });
  }
}
