import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const getCustomerQuery = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      acceptsMarketing
      defaultAddress {
        id
        address1
        address2
        city
        province
        country
        zip
      }
      orders(first: 1) {
        totalCount
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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("shopify_customer_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ customer: null });
    }

    // Fetch customer data using the access token
    const customerResponse = await shopifyStorefrontFetch(getCustomerQuery, {
      customerAccessToken: accessToken,
    });

    const customer = customerResponse.data?.customer;

    if (!customer) {
      // Token is invalid or expired, clear the cookie
      cookieStore.delete("shopify_customer_token");
      return NextResponse.json({ customer: null });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ customer: null });
  }
}
