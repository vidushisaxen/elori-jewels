// /app/api/cart/update/route.ts
import { NextResponse } from 'next/server';
import { getCart, updateCart, removeFromCart } from '../../../lib/shopify';

type UpdateType = 'plus' | 'minus' | 'delete';

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

    // ✅ getCart() reads cartId from cookies internally
    const currentCart = await getCart();

    if (!currentCart?.id) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 });
    }

    const lineItem = currentCart.lines?.find(
      (item) => item.merchandise.id === merchandiseId
    );

    if (!lineItem) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    let updatedCart;

    if (updateType === 'delete') {
      // ✅ removeFromCart() reads cartId from cookies internally
      updatedCart = await removeFromCart([lineItem.id]);
    } else {
      const newQuantity =
        updateType === 'plus' ? lineItem.quantity + 1 : lineItem.quantity - 1;

      if (newQuantity <= 0) {
        updatedCart = await removeFromCart([lineItem.id]);
      } else {
        // ✅ updateCart() reads cartId from cookies internally
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
