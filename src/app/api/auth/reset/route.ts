import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const customerResetByUrlMutation = `
  mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customer {
        id
        email
        firstName
        lastName
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

const customerResetMutation = `
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customer {
        id
        email
        firstName
        lastName
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
    const { resetToken, password, resetUrl } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    let response;

    if (resetUrl) {
      // Use URL-based reset (from email link)
      response = await shopifyStorefrontFetch(customerResetByUrlMutation, {
        resetUrl,
        password,
      });

      const data = response.data?.customerResetByUrl;
      const userErrors = data?.customerUserErrors || [];

      if (userErrors.length > 0) {
        const errorMessage = userErrors.map((e: { message: string }) => e.message).join(", ");
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }

      const accessToken = data?.customerAccessToken?.accessToken;
      const expiresAt = data?.customerAccessToken?.expiresAt;

      if (accessToken) {
        const cookieStore = await cookies();
        const expiresDate = new Date(expiresAt);

        cookieStore.set("shopify_customer_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: expiresDate,
          path: "/",
        });
      }

      return NextResponse.json({
        success: true,
        customer: data?.customer,
      });
    } else if (resetToken) {
      // Use token-based reset (legacy)
      // Extract customer ID and reset token from the combined token
      const [customerId, token] = resetToken.split("/");

      if (!customerId || !token) {
        return NextResponse.json(
          { error: "Invalid reset token format" },
          { status: 400 }
        );
      }

      response = await shopifyStorefrontFetch(customerResetMutation, {
        id: `gid://shopify/Customer/${customerId}`,
        input: {
          resetToken: token,
          password,
        },
      });

      const data = response.data?.customerReset;
      const userErrors = data?.customerUserErrors || [];

      if (userErrors.length > 0) {
        const errorMessage = userErrors.map((e: { message: string }) => e.message).join(", ");
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }

      const accessToken = data?.customerAccessToken?.accessToken;
      const expiresAt = data?.customerAccessToken?.expiresAt;

      if (accessToken) {
        const cookieStore = await cookies();
        const expiresDate = new Date(expiresAt);

        cookieStore.set("shopify_customer_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: expiresDate,
          path: "/",
        });
      }

      return NextResponse.json({
        success: true,
        customer: data?.customer,
      });
    }

    return NextResponse.json(
      { error: "Reset token or URL is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
