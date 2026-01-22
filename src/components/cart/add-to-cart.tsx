'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useStore } from '../../store';
import { useProduct } from '../product/product-context';
import type { Product, ProductVariant } from '../../app/lib/shopify/types';

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const addCartItem = useStore((state) => state.addCartItem);
  const { state } = useProduct();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState<string>('');
  const timerRef = useRef<number | null>(null);

  const [isPending, startTransition] = useTransition();

  const variant = useMemo(
    () =>
      variants.find((variant: ProductVariant) =>
        variant.selectedOptions.every(
          (option) => option.value === state[option.name.toLowerCase()]
        )
      ),
    [variants, state]
  );

  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find((v) => v.id === selectedVariantId);

  const showToast = (text: string) => {
    setToastText(text);
    setToastOpen(true);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToastOpen(false), 3000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleAddToCart = () => {
    if (!selectedVariantId || !finalVariant) return;

    startTransition(async () => {
      try {
        await addCartItem(finalVariant, product);
        showToast(`Added to cart: ${product.title}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showToast(`Failed: ${errorMessage}`);
      }
    });
  };

  const disabled = !availableForSale || !selectedVariantId || isPending;

  return (
    <>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled}
        className="w-full border border-black text-black py-4 px-8 text-sm uppercase tracking-widest hover:bg-black/50 hover:border-transparent hover:text-white cursor-pointer transition-colors disabled:opacity-60"
      >
        {isPending ? 'Adding to Cart…' : 'Add To Cart'}
      </button>

      {/* Bottom-right toast */}
      <div
        className={[
          'fixed bottom-6 right-6 z-[9999] w-[320px] max-w-[90vw]',
          'transition-all duration-300 ease-out',
          toastOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0 pointer-events-none'
        ].join(' ')}
        role="status"
        aria-live="polite"
      >
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-black">Cart updated</p>
              <p className="text-sm text-zinc-600 truncate">{toastText}</p>

              <div className="mt-3 flex gap-3">
                <Link
                  href="/cart"
                  className="text-xs uppercase tracking-widest text-black border-b border-black pb-[2px]"
                  onClick={() => setToastOpen(false)}
                >
                  View Cart
                </Link>
                <button
                  type="button"
                  className="text-xs uppercase tracking-widest text-zinc-500 hover:text-black"
                  onClick={() => setToastOpen(false)}
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close"
              className="h-8 w-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black"
              onClick={() => setToastOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
