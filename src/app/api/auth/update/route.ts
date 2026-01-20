import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const customerUpdateMutation = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
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
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("shopify_customer_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, password, acceptsMarketing } = body;

    // Build the customer update input
    const customerInput: Record<string, unknown> = {};
    
    if (firstName !== undefined) customerInput.firstName = firstName;
    if (lastName !== undefined) customerInput.lastName = lastName;
    if (email !== undefined) customerInput.email = email;
    if (phone !== undefined) customerInput.phone = phone;
    if (password !== undefined) customerInput.password = password;
    if (acceptsMarketing !== undefined) customerInput.acceptsMarketing = acceptsMarketing;

    const response = await shopifyStorefrontFetch(customerUpdateMutation, {
      customerAccessToken: accessToken,
      customer: customerInput,
    });

    const data = response.data?.customerUpdate;
    const userErrors = data?.customerUserErrors || [];

    if (userErrors.length > 0) {
      const errorMessage = userErrors.map((e: { message: string }) => e.message).join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // If a new access token is returned (e.g., after email/password change), update the cookie
    const newAccessToken = data?.customerAccessToken?.accessToken;
    const newExpiresAt = data?.customerAccessToken?.expiresAt;

    if (newAccessToken && newAccessToken !== accessToken) {
      const expiresDate = new Date(newExpiresAt);

      cookieStore.set("shopify_customer_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresDate,
        path: "/",
      });
    }

    return NextResponse.json({ customer: data?.customer });
  } catch (error) {
    console.error("Customer update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
