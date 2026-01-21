// /app/api/wishlist/route.ts
// Wishlist stored in customer metafields via Admin API
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '';
const SHOPIFY_ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || '';

const WISHLIST_NAMESPACE = 'custom';
const WISHLIST_KEY = 'wishlist';

// Parse session token to get email
function getEmailFromSession(): string | null {
  try {
    // This is a sync operation for the function signature
    // We'll get the actual cookie in the route handlers
    return null;
  } catch {
    return null;
  }
}

async function shopifyAdminFetch(query: string, variables: Record<string, unknown>) {
  if (!SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
    throw new Error("Admin API not configured");
  }
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  return response.json();
}

// Get customer by email with wishlist metafield
async function getCustomerWithWishlist(email: string) {
  const query = `
    query findCustomer($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            email
            metafield(namespace: "${WISHLIST_NAMESPACE}", key: "${WISHLIST_KEY}") {
              value
              type
            }
          }
        }
      }
    }
  `;

  const result = await shopifyAdminFetch(query, { query: `email:${email}` });
  return result.data?.customers?.edges?.[0]?.node || null;
}

// Update customer metafield
async function updateCustomerWishlist(customerId: string, wishlist: unknown[]) {
  const mutation = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await shopifyAdminFetch(mutation, {
    input: {
      id: customerId,
      metafields: [{
        namespace: WISHLIST_NAMESPACE,
        key: WISHLIST_KEY,
        type: 'json',
        value: JSON.stringify(wishlist),
      }],
    },
  });

  if (result.data?.customerUpdate?.userErrors?.length > 0) {
    console.error('Customer update errors:', result.data.customerUpdate.userErrors);
    return false;
  }

  return true;
}

// GET - Fetch wishlist from customer metafield
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('shopify_customer_token')?.value;
    const customerEmail = cookieStore.get('customer_email')?.value;

    // Not logged in
    if (!sessionToken) {
      return NextResponse.json({ wishlist: [], authenticated: false });
    }

    // Get email from session token or cookie
    let email = customerEmail;
    
    if (!email) {
      try {
        const session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
        email = session.email;
      } catch {
        return NextResponse.json({ wishlist: [], authenticated: false });
      }
    }

    if (!email) {
      return NextResponse.json({ wishlist: [], authenticated: false });
    }

    if (!SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
      return NextResponse.json({ wishlist: [], authenticated: true, adminApiDisabled: true });
    }

    const customer = await getCustomerWithWishlist(email);

    if (!customer) {
      return NextResponse.json({ wishlist: [], authenticated: false });
    }

    const wishlistValue = customer.metafield?.value;

    if (!wishlistValue) {
      return NextResponse.json({ wishlist: [], authenticated: true });
    }

    try {
      const wishlist = JSON.parse(wishlistValue);
      return NextResponse.json({ wishlist: Array.isArray(wishlist) ? wishlist : [], authenticated: true });
    } catch {
      return NextResponse.json({ wishlist: [], authenticated: true });
    }
  } catch (error) {
    console.error('Error in GET /api/wishlist:', error);
    return NextResponse.json({ wishlist: [], authenticated: false });
  }
}

// POST - Save wishlist to customer metafield
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('shopify_customer_token')?.value;
    const customerEmail = cookieStore.get('customer_email')?.value;

    // Not authenticated
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' });
    }

    // Get email from session token or cookie
    let email = customerEmail;
    
    if (!email) {
      try {
        const session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
        email = session.email;
      } catch {
        return NextResponse.json({ success: false, error: 'Invalid session' });
      }
    }

    if (!email) {
      return NextResponse.json({ success: false, error: 'No email in session' });
    }

    const { wishlist } = await request.json();

    if (!Array.isArray(wishlist)) {
      return NextResponse.json({ success: false, error: 'Invalid wishlist' });
    }

    if (!SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
      return NextResponse.json({ success: true, local: true });
    }

    const customer = await getCustomerWithWishlist(email);
    if (!customer?.id) {
      return NextResponse.json({ success: false, error: 'Customer not found' });
    }

    const success = await updateCustomerWishlist(customer.id, wishlist);
    return NextResponse.json({ success: true, synced: success });
  } catch (error) {
    console.error('Error in POST /api/wishlist:', error);
    return NextResponse.json({ success: false, error: 'Failed to save wishlist' });
  }
}
