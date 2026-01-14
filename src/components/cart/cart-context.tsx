'use client';

import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { Product, ProductVariant } from '../../app/lib/shopify/types';

type UpdateType = 'plus' | 'minus' | 'delete';

// Re-export useCart hook that wraps Zustand store for backwards compatibility
export function useCart() {
  const cart = useStore((state) => state.cart);
  const addCartItem = useStore((state) => state.addCartItem);
  const updateCartItem = useStore((state) => state.updateCartItem);

  return {
    cart,
    addCartItem,
    updateCartItem,
  };
}

// CartProvider now just initializes the cart from API
export function CartProvider({ children }: { children: React.ReactNode }) {
  const fetchCart = useStore((state) => state.fetchCart);
  const isCartLoading = useStore((state) => state.isCartLoading);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return <>{children}</>;
}
