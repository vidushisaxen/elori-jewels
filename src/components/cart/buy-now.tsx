'use client';

import { useMemo, useState, useTransition } from 'react';
import type { Product, ProductVariant } from '../../app/lib/shopify/types';
import { useProduct } from '../product/product-context';

export function BuyNowButton({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { state } = useProduct();
  const [isPending, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const variant = useMemo(
    () =>
      variants.find((v: ProductVariant) =>
        v.selectedOptions.every(
          (option) => option.value === state[option.name.toLowerCase()]
        )
      ),
    [variants, state]
  );

  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find((v) => v.id === selectedVariantId);

  const disabled =
    !availableForSale || !selectedVariantId || isPending || isRedirecting;

  const handleBuyNow = () => {
    if (!selectedVariantId || !finalVariant) return;

    setError(null);
    startTransition(async () => {
      try {
        setIsRedirecting(true);
        const res = await fetch('/api/buy-now', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId: selectedVariantId, quantity: 1 })
        });

        const data = await res.json();

        if (res.ok && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          setError(data?.error || 'Failed to create checkout');
          console.error('Buy now failed', data?.error || data);
          setIsRedirecting(false);
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
        console.error('Buy now error:', err);
        setIsRedirecting(false);
      }
    });
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={disabled}
        className="w-full bg-amber-600 text-white py-4 px-8 text-sm uppercase tracking-widest hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending || isRedirecting ? 'Processing…' : 'Buy Now'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}

