import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

// Create cart with buyer identity if customer is logged in
const createCartMutation = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        buyerIdentity {
          customer {
            id
            email
          }
        }
      }
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  return response.json();
}

export async function POST(request: Request) {
  try {
    const { variantId } = (await request.json()) as { variantId?: string };

    if (!variantId) {
      return NextResponse.json(
        { error: 'variantId is required' },
        { status: 400 }
      );
    }

    // Check if customer is logged in
    const cookieStore = await cookies();
    const customerAccessToken = cookieStore.get('shopify_customer_token')?.value;

    // Build cart input
    const cartInput: {
      lines: { merchandiseId: string; quantity: number }[];
      buyerIdentity?: { customerAccessToken: string };
    } = {
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    };

    // If customer is logged in, associate the cart with them
    // This ensures the order will be linked to their account
    if (customerAccessToken) {
      cartInput.buyerIdentity = { customerAccessToken };
    }

    const response = await shopifyStorefrontFetch(createCartMutation, {
      input: cartInput,
    });

    if (response.errors) {
      console.error('GraphQL errors:', response.errors);
      return NextResponse.json(
        { error: response.errors[0]?.message || 'Failed to create cart' },
        { status: 500 }
      );
    }

    const cart = response.data?.cartCreate?.cart;
    const userErrors = response.data?.cartCreate?.userErrors || [];

    if (userErrors.length > 0) {
      console.error('User errors:', userErrors);
      return NextResponse.json(
        { error: userErrors[0]?.message || 'Failed to create cart' },
        { status: 400 }
      );
    }

    if (!cart?.checkoutUrl) {
      return NextResponse.json(
        { error: 'Missing checkout URL from Shopify' },
        { status: 500 }
      );
    }

    console.log(`[Buy Now] Cart created${customerAccessToken ? ' with customer' : ''}: ${cart.id}`);

    return NextResponse.json({ checkoutUrl: cart.checkoutUrl });
  } catch (error) {
    console.error('Error in /api/buy-now:', error);
    return NextResponse.json(
      {
        error: 'Failed to create buy-now checkout',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
