import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const customerCreateMutation = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerAccessTokenCreateMutation = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
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

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, acceptsMarketing } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Create customer
    const createResponse = await shopifyStorefrontFetch(customerCreateMutation, {
      input: {
        email,
        password,
        firstName: firstName || "",
        lastName: lastName || "",
        acceptsMarketing: acceptsMarketing || false,
      },
    });

    const createData = createResponse.data?.customerCreate;
    const createErrors = createData?.customerUserErrors || [];

    if (createErrors.length > 0) {
      const errorMessage = createErrors.map((e: { message: string }) => e.message).join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Auto-login after registration - create access token
    const tokenResponse = await shopifyStorefrontFetch(
      customerAccessTokenCreateMutation,
      {
        input: { email, password },
      }
    );

    const tokenData = tokenResponse.data?.customerAccessTokenCreate;
    const tokenErrors = tokenData?.customerUserErrors || [];

    if (tokenErrors.length > 0) {
      // Customer created but couldn't auto-login
      return NextResponse.json({
        customer: createData.customer,
        message: "Account created. Please log in.",
      });
    }

    const accessToken = tokenData?.customerAccessToken?.accessToken;
    const expiresAt = tokenData?.customerAccessToken?.expiresAt;

    if (!accessToken) {
      return NextResponse.json({
        customer: createData.customer,
        message: "Account created. Please log in.",
      });
    }

    // Fetch full customer data
    const customerResponse = await shopifyStorefrontFetch(getCustomerQuery, {
      customerAccessToken: accessToken,
    });

    const customer = customerResponse.data?.customer || createData.customer;

    // Set secure HTTP-only cookie with the access token
    const cookieStore = await cookies();
    const expiresDate = new Date(expiresAt);

    cookieStore.set("shopify_customer_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresDate,
      path: "/",
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
