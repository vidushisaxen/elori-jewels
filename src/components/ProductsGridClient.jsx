"use client";

import { useMemo, useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import WishlistButton from "./WishlistButton";
import Image from "next/image";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { GridIcon } from "lucide-react";

// Register GSAP Flip plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

// Product card component with smooth hover animations (matching Jewellery.tsx)
function ProductCard({ product }) {
  const defaultImageRef = useRef(null);
  const hoverImageRef = useRef(null);
  const titleRef = useRef(null);

  const firstImage = product.images?.[0];
  const secondImage = product.images?.[1];
  const price = product.variants?.[0]?.price;

  // Map product to the shape WishlistButton expects
  const productForWishlist = {
    id: product.id ?? product.handle,
    handle: product.handle,
    title: product.title,
    featuredImage: { url: firstImage?.url },
    images: [
      { url: firstImage?.url },
      { url: secondImage?.url || firstImage?.url }
    ],
    priceRange: price ? {
      maxVariantPrice: {
        amount: price.amount,
        currencyCode: price.currencyCode
      }
    } : undefined,
    variants: product.variants
  };

  const handleMouseEnter = () => {
    if (!defaultImageRef.current || !hoverImageRef.current) return;

    defaultImageRef.current.style.transform = 'scale(1.15)';
    defaultImageRef.current.style.opacity = '0';
    defaultImageRef.current.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';

    hoverImageRef.current.style.transform = 'scale(1.1)';
    hoverImageRef.current.style.opacity = '1';
    hoverImageRef.current.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';


  };

  const handleMouseLeave = () => {
    if (!defaultImageRef.current || !hoverImageRef.current) return;

    defaultImageRef.current.style.transform = 'scale(1)';
    defaultImageRef.current.style.opacity = '1';
    defaultImageRef.current.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';

    hoverImageRef.current.style.transform = 'scale(1.15)';
    hoverImageRef.current.style.opacity = '0';
    hoverImageRef.current.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';

    if (titleRef.current) {
      titleRef.current.style.color = '#000000';
      titleRef.current.style.transition = 'color 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    }
  };

  return (
    <Link href={`/product/${product.handle}`} className="block cursor-pointer">
      <div
        className="relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full aspect-3/4 overflow-hidden bg-neutral-50">
          {firstImage ? (
            <>
              {/* Wishlist button */}
              <div 
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:bg-white transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <WishlistButton product={productForWishlist} />
              </div>

              <Image
              height={500}
              width={500}
                ref={defaultImageRef}
                src={firstImage.url}
                alt={firstImage.altText || product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <Image
              height={500}
              width={500}
                ref={hoverImageRef}
                src={secondImage?.url || firstImage.url}
                alt={`${product.title} Detail`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 scale-[1.15]"
              />
            </>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-400 text-sm tracking-wide">No image</span>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <h3
            ref={titleRef}
            className="text-sm font-light uppercase tracking-[0.2em] text-black "
          >
            {product.title}
          </h3>

          {product.description && (
            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {price && (
            <p className="text-sm font-light text-neutral-600 tracking-wider">
              {price.amount} {price.currencyCode}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProductsGridClient({ products, defaultCols = 4 }) {
  const [cols, setCols] = useState(defaultCols);
  const gridRef = useRef(null);

  // Tailwind-safe (strings are explicit so they won't get purged)
  const gridColsClass = useMemo(() => {
    return {
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
    }[cols];
  }, [cols]);

  // Use GSAP Flip to animate grid layout changes
  useLayoutEffect(() => {
    if (!gridRef.current) return;

    const state = Flip.getState(gridRef.current.children);
    
    // After the DOM updates with new grid class
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: "power2.inOut",
        scale: true,
        simple: true,
        stagger: 0.02,
      });
    });
  }, [cols]);

  return (
    <div>
      {/* Grid Controls */}
      <div className="mb-5 flex justify-end ">
        <GridSlider cols={cols} setCols={setCols} />
      </div>

      {/* Products Grid */}
      <div ref={gridRef} className={`grid grid-cols-1 gap-x-8 gap-y-12 ${gridColsClass}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
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
      <div className="h-9 w-9 grid place-items-center  bg-white">
       <GridIcon />
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
