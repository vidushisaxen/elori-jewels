// /app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { getCart, updateCart, removeFromCart } from '../../lib/shopify';

type UpdateType = 'plus' | 'minus' | 'delete';

// GET - Fetch current cart
export async function GET() {
  try {
    const cart = await getCart();
    
    if (!cart) {
      // Return empty cart structure if no cart exists
      return NextResponse.json({
        id: undefined,
        checkoutUrl: '',
        totalQuantity: 0,
        lines: [],
        cost: {
          subtotalAmount: { amount: '0', currencyCode: 'USD' },
          totalAmount: { amount: '0', currencyCode: 'USD' },
          totalTaxAmount: { amount: '0', currencyCode: 'USD' },
        },
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cart',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// POST - Update cart item
export async function POST(request: Request) {
  try {
    const { merchandiseId, updateType } = (await request.json()) as {
      merchandiseId?: string;
      updateType?: UpdateType;
    };

    if (!merchandiseId || !updateType) {
      return NextResponse.json(
        { error: 'merchandiseId and updateType are required' },
        { status: 400 }
      );
    }

    const currentCart = await getCart();

    if (!currentCart?.id) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 });
    }

    if (!Array.isArray(currentCart.lines)) {
      return NextResponse.json({ error: 'Cart lines missing' }, { status: 500 });
    }

    const lineItem = currentCart.lines.find(
      (item) => item?.merchandise?.id === merchandiseId
    );

    if (!lineItem?.id) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    let updatedCart;

    if (updateType === 'delete') {
      updatedCart = await removeFromCart([lineItem.id]);
    } else {
      const newQuantity =
        updateType === 'plus' ? lineItem.quantity + 1 : lineItem.quantity - 1;

      if (newQuantity <= 0) {
        updatedCart = await removeFromCart([lineItem.id]);
      } else {
        updatedCart = await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity: newQuantity
          }
        ]);
      }
    }

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      {
        error: 'Failed to update cart',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
