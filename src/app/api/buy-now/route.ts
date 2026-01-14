import { NextResponse } from 'next/server';
import { createCartWithLines } from '../../lib/shopify';

export async function POST(request: Request) {
  try {
    const { variantId } = (await request.json()) as { variantId?: string };

    if (!variantId) {
      return NextResponse.json(
        { error: 'variantId is required' },
        { status: 400 }
      );
    }

    // Create a separate, one-off cart that only contains this line item.
    // We do NOT touch the main cart cookie, so the user's cart stays unchanged.
    const cart = await createCartWithLines([
      { merchandiseId: variantId, quantity: 1 }
    ]);

    if (!cart.checkoutUrl) {
      return NextResponse.json(
        { error: 'Missing checkout URL from Shopify' },
        { status: 500 }
      );
    }

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


