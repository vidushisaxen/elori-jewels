"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useStore, WishlistItem } from "../../store";

export default function WishlistPage() {
  const wishlistItems = useStore((state) => state.wishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const addCartItem = useStore((state) => state.addCartItem);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAddingId, setIsAddingId] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const timerRef = useRef<number | null>(null);

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

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h1 className="text-4xl font-light uppercase tracking-wide mb-8 text-center">
            My Wishlist
          </h1>

          <div className="flex flex-col items-center justify-center py-20">
            <Heart className="w-24 h-24 text-zinc-300 mb-6" />
            <h2 className="text-2xl font-light text-zinc-600 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-zinc-500 mb-8 text-center max-w-md">
              Save your favorite items to your wishlist and come back to them
              later.
            </p>
            <Link
              href="/products"
              className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-zinc-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light uppercase tracking-wide mb-2">
              My Wishlist
            </h1>
            <p className="text-zinc-600 text-sm">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((item: WishlistItem) => (
            <div
              key={item.id}
              className="group relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link href={`/product/${item.handle}`}>
                <div className="relative aspect-3/4 overflow-hidden bg-zinc-100 mb-4">
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWishlist(item.id);
                    }}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                    aria-label="Remove from wishlist"
                  >
                    <X className="w-5 h-5 text-zinc-700" />
                  </button>

                  {/* Product Images */}
                  <img
                    src={item.defaultImage}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
                    style={{
                      opacity: hoveredItem === item.id ? 0 : 1,
                      transform:
                        hoveredItem === item.id ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                  <img
                    src={item.hoverImage || item.defaultImage}
                    alt={`${item.name} Detail`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
                    style={{
                      opacity: hoveredItem === item.id ? 1 : 0,
                      transform:
                        hoveredItem === item.id ? "scale(1.15)" : "scale(1.2)",
                    }}
                  />

                  {/* Add to Cart Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Cart button can be added here if needed */}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-light tracking-[0.15em] uppercase text-zinc-700 group-hover:text-zinc-900 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-zinc-600 tracking-wider">
                    {item.price}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-16 text-center border-t border-zinc-200 pt-12">
          <Link
            href="/products"
            className="inline-block bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-zinc-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Toast */}
      <div
        className={[
          "fixed bottom-6 right-6 z-[9999] w-[320px] max-w-[90vw]",
          "transition-all duration-300 ease-out",
          toastOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none",
        ].join(" ")}
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
    </div>
  );
}
