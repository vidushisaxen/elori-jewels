// /app/api/cart/associate/route.ts
// Attach cart to customer using cartBuyerIdentityUpdate
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

const cartBuyerIdentityUpdateMutation = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    handle
                    title
                    featuredImage {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
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

export async function POST() {
  try {
    const cookieStore = await cookies();
    const customerAccessToken = cookieStore.get('shopify_customer_token')?.value;
    const cartId = cookieStore.get('cartId')?.value;

    // Must have both customer token and cart
    if (!customerAccessToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' });
    }

    if (!cartId) {
      // No cart to associate - that's fine
      return NextResponse.json({ success: true, message: 'No cart to associate' });
    }

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      return NextResponse.json({ success: false, error: 'Shopify not configured' });
    }

    // Call cartBuyerIdentityUpdate to attach cart to customer
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: cartBuyerIdentityUpdateMutation,
          variables: {
            cartId,
            buyerIdentity: {
              customerAccessToken,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Shopify API error:', response.status);
      return NextResponse.json({ success: false, error: 'API error' });
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json({ success: false, error: data.errors[0]?.message });
    }

    const result = data.data?.cartBuyerIdentityUpdate;

    if (result?.userErrors?.length > 0) {
      console.error('User errors:', result.userErrors);
      return NextResponse.json({ success: false, error: result.userErrors[0]?.message });
    }

    // Reshape cart lines
    const cart = result?.cart;
    if (cart) {
      cart.lines = cart.lines?.edges?.map((edge: any) => edge.node) || [];
    }

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Error in POST /api/cart/associate:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
