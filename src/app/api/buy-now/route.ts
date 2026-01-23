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
          email
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

// Query cart to get updated checkout URL after buyer identity is set
const getCartQuery = `
  query getCart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      buyerIdentity {
        email
        customer {
          id
          email
        }
      }
    }
  }
`;

// Update cart buyer identity
const updateBuyerIdentityMutation = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
        buyerIdentity {
          email
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
    const sessionToken = cookieStore.get('shopify_customer_token')?.value;
    const customerEmail = cookieStore.get('customer_email')?.value;

    // Build cart input
    const cartInput: {
      lines: { merchandiseId: string; quantity: number }[];
      buyerIdentity?: { email: string };
    } = {
      lines: [{ merchandiseId: variantId, quantity: 1 }],
    };

    // If customer is logged in, use their email for buyerIdentity
    // NOTE: We cannot use Customer Account API token (shcat_...) as Storefront customerAccessToken
    // Instead, we use buyerIdentity.email which Shopify can use to associate the cart
    if (sessionToken && customerEmail) {
      cartInput.buyerIdentity = { email: customerEmail };
    }

    // Step 1: Create the cart
    const createResponse = await shopifyStorefrontFetch(createCartMutation, {
      input: cartInput,
    });

    if (createResponse.errors) {
      console.error('GraphQL errors:', createResponse.errors);
      return NextResponse.json(
        { error: createResponse.errors[0]?.message || 'Failed to create cart' },
        { status: 500 }
      );
    }

    const createdCart = createResponse.data?.cartCreate?.cart;
    const userErrors = createResponse.data?.cartCreate?.userErrors || [];

    if (userErrors.length > 0) {
      console.error('User errors:', userErrors);
      return NextResponse.json(
        { error: userErrors[0]?.message || 'Failed to create cart' },
        { status: 400 }
      );
    }

    if (!createdCart?.id) {
      return NextResponse.json(
        { error: 'Failed to create cart - no cart ID returned' },
        { status: 500 }
      );
    }

    let checkoutUrl = createdCart.checkoutUrl;
    const cartId = createdCart.id;

    // Step 2: If customer is logged in, update buyer identity to ensure checkout recognizes them
    if (sessionToken && customerEmail) {
      try {
        const updateResponse = await shopifyStorefrontFetch(updateBuyerIdentityMutation, {
          cartId,
          buyerIdentity: {
            email: customerEmail,
          },
        });

        if (!updateResponse.errors && updateResponse.data?.cartBuyerIdentityUpdate?.cart) {
          const updatedCart = updateResponse.data.cartBuyerIdentityUpdate.cart;
          // Use the updated checkout URL which should now recognize the logged-in customer
          if (updatedCart.checkoutUrl) {
            checkoutUrl = updatedCart.checkoutUrl;
          }
          console.log(`[Buy Now] Cart associated with customer email: ${customerEmail}`);
        }
      } catch (updateError) {
        // If update fails, still proceed with the original checkout URL
        console.warn('[Buy Now] Failed to update buyer identity, using original checkout URL:', updateError);
      }
    }

    // Step 3: Final query to get the checkout URL (ensures it's up-to-date)
    if (checkoutUrl) {
      try {
        const cartQueryResponse = await shopifyStorefrontFetch(getCartQuery, {
          id: cartId,
        });

        if (!cartQueryResponse.errors && cartQueryResponse.data?.cart?.checkoutUrl) {
          checkoutUrl = cartQueryResponse.data.cart.checkoutUrl;
        }
      } catch (queryError) {
        // If query fails, use the checkout URL we already have
        console.warn('[Buy Now] Failed to query cart, using existing checkout URL:', queryError);
      }
    }

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Missing checkout URL from Shopify' },
        { status: 500 }
      );
    }

    console.log(`[Buy Now] Cart created${customerEmail ? ' with customer email' : ' (anonymous)'}: ${cartId}`);

    return NextResponse.json({ checkoutUrl });
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
