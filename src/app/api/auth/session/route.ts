// /api/auth/session - Check current session and return customer data
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SHOPIFY_STORE_ID = process.env.SHOPIFY_STORE_ID || "97678459179";
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

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

// Parse session token
function parseSessionToken(token: string): SessionData | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString());
  } catch {
    return null;
  }
}

// Fetch customer data using Customer Account API
async function fetchCustomerFromAccountAPI(accessToken: string) {
  const customerApiUrl = `https://shopify.com/${SHOPIFY_STORE_ID}/account/customer/api/2024-07/graphql`;

  const query = `
    query {
      customer {
        id
        emailAddress {
          emailAddress
        }
        firstName
        lastName
        phoneNumber {
          phoneNumber
        }
        defaultAddress {
          address1
          address2
          city
          province
          country
          zip
        }
        orders(first: 10) {
          edges {
            node {
              id
              number
              processedAt
              financialStatus
              fulfillments {
                status
              }
              totalPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(customerApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": accessToken,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.data?.customer;
  } catch (error) {
    console.error("[Session] Error fetching from Customer Account API:", error);
    return null;
  }
}

// Fetch customer data using Admin API (fallback)
async function fetchCustomerFromAdminAPI(email: string) {
  if (!SHOPIFY_ADMIN_API_ACCESS_TOKEN) return null;

  const query = `
    query findCustomer($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            email
            firstName
            lastName
            phone
            defaultAddress {
              address1
              address2
              city
              province
              country
              zip
            }
            ordersCount
            orders(first: 10) {
              edges {
                node {
                  id
                  name
                  createdAt
                  displayFinancialStatus
                  displayFulfillmentStatus
                  totalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables: { query: `email:${email}` } }),
      }
    );

    const data = await response.json();
    return data.data?.customers?.edges?.[0]?.node;
  } catch (error) {
    console.error("[Session] Error fetching from Admin API:", error);
    return null;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("shopify_customer_token")?.value;
    const customerEmail = cookieStore.get("customer_email")?.value;

    if (!sessionToken) {
      return NextResponse.json({ customer: null });
    }

    // Parse session
    const session = parseSessionToken(sessionToken);

    if (!session) {
      cookieStore.delete("shopify_customer_token");
      cookieStore.delete("customer_email");
      return NextResponse.json({ customer: null });
    }

    // Check if session expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      // TODO: Implement token refresh using refresh_token
      cookieStore.delete("shopify_customer_token");
      cookieStore.delete("customer_email");
      return NextResponse.json({ customer: null });

    }

    // Try to fetch customer from Customer Account API
    let customer = null;
    
    if (session.accessToken && !session.accessToken.startsWith("mock-")) {
      customer = await fetchCustomerFromAccountAPI(session.accessToken);
    }

    // Fallback to Admin API
    if (!customer && (session.customer?.email || customerEmail)) {
      const email = session.customer?.email || customerEmail;
      const adminCustomer = await fetchCustomerFromAdminAPI(email!);
      
      if (adminCustomer) {
        // Transform Admin API response to match expected format
        const orders = adminCustomer.orders?.edges?.map((edge: any) => ({
          id: edge.node.id,
          orderNumber: edge.node.name,
          processedAt: edge.node.createdAt,
          financialStatus: edge.node.displayFinancialStatus,
          fulfillmentStatus: edge.node.displayFulfillmentStatus,
          totalPrice: edge.node.totalPriceSet?.shopMoney,
        })) || [];

        return NextResponse.json({
          customer: {
            id: adminCustomer.id,
            email: adminCustomer.email,
            firstName: adminCustomer.firstName || "",
            lastName: adminCustomer.lastName || "",
            phone: adminCustomer.phone,
            defaultAddress: adminCustomer.defaultAddress,
            orders: {
              totalCount: adminCustomer.ordersCount || 0,
              edges: orders.map((order: any) => ({ node: order })),
            },
          },
        });
      }
    }

    // If we got customer from Customer Account API
    if (customer) {
      const orders = customer.orders?.edges?.map((edge: any) => ({
        id: edge.node.id,
        orderNumber: `#${edge.node.number}`,
        processedAt: edge.node.processedAt,
        financialStatus: edge.node.financialStatus,
        fulfillmentStatus: edge.node.fulfillments?.[0]?.status || "UNFULFILLED",
        totalPrice: edge.node.totalPrice,
      })) || [];

      return NextResponse.json({
        customer: {
          id: customer.id,
          email: customer.emailAddress?.emailAddress,
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          phone: customer.phoneNumber?.phoneNumber,
          defaultAddress: customer.defaultAddress,
          orders: {
            totalCount: orders.length,
            edges: orders.map((order: any) => ({ node: order })),
          },

        },
      });
    }

    // Return session customer data as fallback
    if (session.customer) {
      return NextResponse.json({
        customer: {
          id: session.customer.id,
          email: session.customer.email,
          firstName: session.customer.firstName || "",
          lastName: session.customer.lastName || "",
          orders: { totalCount: 0, edges: [] },
        },
      });
    }

    return NextResponse.json({ customer: null });
  } catch (error) {
    console.error("[Session] Error:", error);
    return NextResponse.json({ customer: null });
  }
}
