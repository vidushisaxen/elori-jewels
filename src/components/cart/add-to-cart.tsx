// components/cart/add-to-cart.tsx
'use client';

import { useActionState } from 'react';
import { useCart } from './cart-context';
import { useProduct } from '../product/product-context';
import { addItem } from './actions';
import type { Product, ProductVariant } from '../../app/lib/shopify/types';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';


export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();

  const [message, formAction] = useActionState(addItem, null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState<string>('');
  const timerRef = useRef<number | null>(null);

  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);

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

    // ✅ updates immediately
    setIsAdding(true);

    // ✅ optimistic UI update
    addCartItem(finalVariant, product);

    // ✅ call server action without using form submission lifecycle
    startTransition(async () => {
    //   const err = await formAction(selectedVariantId);

    //   setIsAdding(false);

    //   if (!err) {
    //     showToast(`Added to cart: ${product.title}`);
    //   } else {
    //     showToast('Could not add to cart. Please try again.');
    //   }
    const err = await formAction(selectedVariantId);

setIsAdding(false);

if (err === undefined || err === null) {
  showToast(`Added to cart: ${product.title}`);
} else {
  showToast('Could not add to cart. Please try again.');
}
 });
  };

  const disabled = !availableForSale || !selectedVariantId || isAdding || isPending;

  return (
    <>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled}
        className="w-full bg-black text-white py-4 px-8 text-sm uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-60"
      >
        {isAdding || isPending ? 'Adding to Cart…' : 'Add To Cart'}
      </button>

      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>

      {/* ✅ Bottom-right toast */}
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
