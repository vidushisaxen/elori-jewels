"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const WISHLIST_KEY = "wishlist";

function readWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(items) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch {
    // ignore storage failures
  }
}

export default function ProductsGridClient({ products, defaultCols = 4 }) {
  const [cols, setCols] = useState(defaultCols);

  // Keep wishlisted product IDs in a Set for quick checks
  const [wishSet, setWishSet] = useState(() => new Set());

  // Load wishlist once on mount
  useEffect(() => {
    const items = readWishlist();
    setWishSet(new Set(items.map((i) => i.id)));
  }, []);

  const isWishlisted = useCallback(
    (productId) => wishSet.has(productId),
    [wishSet]
  );

  const toggleWishlist = useCallback((product) => {
    const current = readWishlist();

    const exists = current.some((i) => i.id === product.id);
    let next;

    if (exists) {
      next = current.filter((i) => i.id !== product.id);
    } else {
      const firstImage = product.images?.[0]?.url;
      const secondImage = product.images?.[1]?.url;
      const priceObj = product.variants?.[0]?.price;

      next = [
        ...current,
        {
          id: product.id,
          handle: product.handle,
          title: product.title,
          price: priceObj ? `${priceObj.amount} ${priceObj.currencyCode}` : null,
          defaultImage: firstImage || null,
          hoverImage: secondImage || null,
        },
      ];
    }

    writeWishlist(next);
    setWishSet(new Set(next.map((i) => i.id)));
  }, []);

  // Tailwind-safe (strings are explicit so they won't get purged)
  const gridColsClass = useMemo(() => {
    return {
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
    }[cols];
  }, [cols]);

  return (
    <div>
      {/* Grid Controls */}
      <div className="mb-8 flex justify-end">
        <GridSlider cols={cols} setCols={setCols} />
      </div>

      {/* Products Grid */}
      <div className={`grid grid-cols-1 gap-8 ${gridColsClass}`}>
        {products.map((product) => {
          const firstImage = product.images?.[0];
          const secondImage = product.images?.[1];
          const price = product.variants?.[0]?.price;

          const wished = isWishlisted(product.id);

          return (
            <Link
              key={product.id}
              href={`/product/${product.handle}`}
              className="group"
            >
              <div className="relative overflow-hidden bg-zinc-100">
                {firstImage ? (
                  <>
                    {/* Wishlist button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
                      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${
                          wished
                            ? "fill-red-500 stroke-red-500"
                            : "stroke-zinc-700 hover:stroke-red-500"
                        }`}
                      />
                    </button>

                    <img
                      src={firstImage.url}
                      alt={firstImage.altText || product.title}
                      width={500}
                      height={500}
                      className="h-96 w-full object-cover transition-all duration-700 ease-out group-hover:opacity-0 group-hover:scale-110"
                    />
                    {secondImage && (
                      <img
                        src={secondImage.url}
                        alt={secondImage.altText || product.title}
                        width={500}
                        height={500}
                        className="absolute inset-0 h-96 w-full object-cover opacity-0 scale-110 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                      />
                    )}
                  </>
                ) : (
                  <div className="h-96 w-full bg-zinc-200 flex items-center justify-center">
                    <span className="text-zinc-400 text-sm">No image</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-light uppercase tracking-[0.2em] text-black transition-colors duration-300 group-hover:text-neutral-500">
                  {product.title}
                </h3>

                {product.description && (
                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {price && (
                  <p className="text-sm font-light text-zinc-800">
                    {price.amount} {price.currencyCode}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function GridSlider({ cols, setCols }) {
  const min = 2;
  const max = 5;
  const percent = ((cols - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-3">
      {/* Grid icon */}
      <div className="h-9 w-9 grid place-items-center border border-neutral-200 bg-white">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" stroke="currentColor" />
          <rect x="9" y="1" width="6" height="6" stroke="currentColor" />
          <rect x="1" y="9" width="6" height="6" stroke="currentColor" />
          <rect x="9" y="9" width="6" height="6" stroke="currentColor" />
        </svg>
      </div>

      {/* Slider */}
      <div className="relative w-56">
        <div className="relative h-[2px] w-full bg-neutral-300">
          {/* Filled track */}
          <motion.div
            className="absolute left-0 top-0 h-[2px] bg-neutral-900"
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          />
          {/* Thumb */}
          <motion.div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-neutral-900"
            animate={{ left: `calc(${percent}% - 8px)` }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={cols}
          onChange={(e) => setCols(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          aria-label="Grid columns"
        />
      </div>
    </div>
  );
}
