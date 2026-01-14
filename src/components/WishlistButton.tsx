'use client';

import { useEffect, useState } from 'react';
import { useStore } from '../store';

// Helper to normalize product ID for comparison
function normalizeId(id: string): string {
  if (!id) return '';
  const match = id.match(/\/(\d+)$/);
  return match ? match[1] : id;
}

export default function WishlistButton({ product }: { product: any }) {
  const [mounted, setMounted] = useState(false);
  const wishlist = useStore((state) => state.wishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const hasHydrated = useStore((state) => state._hasHydrated);

  // Ensure component re-renders after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const productId = product?.id ?? product?.handle;
  const handle = product.handle;

  const defaultImage = product.featuredImage?.url || '';
  const hoverImage = product.images?.[1]?.url || product.images?.[0]?.url || defaultImage;

  const variantId = product.variants?.[0]?.id;

  const currency = product.priceRange?.maxVariantPrice?.currencyCode;
  const amount = product.priceRange?.maxVariantPrice?.amount;
  const price = currency && amount ? `${currency} ${amount}` : '';

  // Check if wishlisted using normalized ID and handle
  const normalizedProductId = normalizeId(productId);
  const isWishlisted = mounted && hasHydrated && wishlist.some((x) => 
    normalizeId(x.id) === normalizedProductId || x.handle === handle
  );

  const toggle = () => {
    toggleWishlist({
      id: productId,
      handle,
      name: product.title,
      price,
      defaultImage,
      hoverImage,
      ...(variantId ? { variantId } : {}),
    });
  };

  return (
    <button type="button" onClick={toggle} aria-label="Toggle wishlist" className="text-xl">
      <svg
        className={`w-5 h-5 transition-colors ${
          isWishlisted ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-zinc-700 hover:stroke-red-500'
        }`}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
