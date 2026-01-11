'use client';

import { useEffect, useState } from 'react';
import type { Product } from '../app/lib/shopify/types'; // adjust path if needed

export default function WishlistButton({ product, className = '' }: { product: Product; className?: string }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.some((item: any) => item.id === product.id));
  }, [product.id]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.some((item: any) => item.id === product.id);
    if (exists) return;

    // ✅ Always store a valid variant id
    const firstVariantId = product.variants?.[0]?.id;
    if (!firstVariantId) {
      console.error('No variants on product:', product);
      return;
    }

    const wishlistItem = {
      id: product.id,
      handle: product.handle,
      name: product.title,
      variantId: firstVariantId, // ✅ THIS FIXES YOUR ISSUE
      price: `${product.priceRange.maxVariantPrice.currencyCode} ${product.priceRange.maxVariantPrice.amount}`,
      defaultImage: product.images?.[0]?.url || '',
      hoverImage: product.images?.[1]?.url || product.images?.[0]?.url || ''
    };

    localStorage.setItem('wishlist', JSON.stringify([...wishlist, wishlistItem]));
    setIsWishlisted(true);
  };

  return (
    <button
      onClick={handleWishlistClick}
      className={`z-50 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      aria-label={isWishlisted ? 'In wishlist' : 'Add to wishlist'}
    >
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
