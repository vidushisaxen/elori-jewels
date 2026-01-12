// app/api/cart/add/route.ts
import { NextResponse } from 'next/server';
import { addToCart, createCart, getCart } from '../../../lib/shopify';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { variant, product } = await request.json();
    
    console.log('📦 Adding to cart:', { 
      variantId: variant?.id, 
      productTitle: product?.title 
    });

    if (!variant?.id) {
      console.error('❌ No variant ID provided');
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    let cartId = cookieStore.get('cartId')?.value;

    console.log('🛒 Current cartId:', cartId || 'none');

    // If no cart exists, create one first
    if (!cartId) {
      console.log('🆕 Creating new cart...');
      const newCart = await createCart();
      
      if (!newCart?.id) {
        console.error('❌ Failed to create cart');
        return NextResponse.json(
          { error: 'Failed to create cart' },
          { status: 500 }
        );
      }
      
      cartId = newCart.id;
      console.log('✅ New cart created:', cartId);
      
      // Set the cart ID cookie
      cookieStore.set('cartId', cartId, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      });
    }

    // Add item to cart
    console.log('➕ Adding item to cart:', cartId);
   const cart = await addToCart([
    { merchandiseId: variant.id, quantity: 1 }
  ]);

    if (!cart) {
      console.error('❌ addToCart returned null/undefined');
      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      );
    }

    console.log('✅ Item added successfully. Cart lines:', cart.lines?.length || 0);

    // Update cart ID cookie (in case it changed)
    if (cart.id && cart.id !== cartId) {
      cookieStore.set('cartId', cart.id, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('❌ Error in /api/cart/add:', error);
    
    // Return more detailed error info
    return NextResponse.json(
      { 
        error: 'Failed to add to cart',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}