'use client';

import { useEffect, useState } from 'react';

type WishlistItem = {
  id: string;
  handle: string;
  name: string;
  price: string;
  defaultImage: string;
  hoverImage?: string;
  variantId?: string; // ✅ OPTIONAL
};

function readWishlist(): WishlistItem[] {
  try {
    const raw = localStorage.getItem('wishlist');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(items: WishlistItem[]) {
  localStorage.setItem('wishlist', JSON.stringify(items));
  window.dispatchEvent(new Event('wishlist:changed'));
}

export default function WishlistButton({ product }: { product: any }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productId = product?.id ?? product?.handle;
  const handle = product.handle;

  const defaultImage = product.featuredImage?.url || '';
  const hoverImage = product.images?.[1]?.url || product.images?.[0]?.url || defaultImage;

  // pick a variant id (first variant)
  const variantId = product.variants?.[0]?.id;

  // format price from priceRange (or variant price)
  const currency = product.priceRange?.maxVariantPrice?.currencyCode;
  const amount = product.priceRange?.maxVariantPrice?.amount;
  const price = currency && amount ? `${currency} ${amount}` : '';

  useEffect(() => {
    const wishlist = readWishlist();
   setIsWishlisted(wishlist.some((x) => x.id === productId));
  }, [productId]);

  const toggle = () => {
  const wishlist = readWishlist();
  const exists = wishlist.some((x) => x.id === productId);

  if (exists) {
    const next = wishlist.filter((x) => x.id !== productId);
    writeWishlist(next);
    setIsWishlisted(false);
    return;
  }

  const item = {
    id: productId,
  handle: product.handle,
  name: product.title,
    price, 
    defaultImage,
    hoverImage,
    ...(variantId ? { variantId } : {}) // ✅ optional
  };

  writeWishlist([...wishlist, item]);
  setIsWishlisted(true);
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

