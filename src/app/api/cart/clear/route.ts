import { NextResponse } from 'next/server';
import { getCart, removeFromCart } from '../../../lib/shopify';

export async function POST() {
  try {
    const currentCart = await getCart();

    if (!currentCart?.id) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 });
    }

    if (!currentCart.lines || currentCart.lines.length === 0) {
      // Cart is already empty
      return NextResponse.json(currentCart);
    }

    // Get all line item IDs
    const lineIds = currentCart.lines
      .map((item) => item.id)
      .filter((id): id is string => !!id);

    if (lineIds.length === 0) {
      return NextResponse.json(currentCart);
    }

    // Remove all items from the cart
    const clearedCart = await removeFromCart(lineIds);

    return NextResponse.json(clearedCart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear cart',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

