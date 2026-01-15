"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import WishlistButton from "./WishlistButton";
import SmoothySlider, { Slide } from "./SmoothySlider";
import Image from 'next/image';

const ProductItemInCollection = ({ product }) => {
  const itemRef = useRef(null);
  const defaultImageRef = useRef(null);
  const hoverImageRef = useRef(null);
  const nameRef = useRef(null);

  const defaultImage = product.images?.[0]?.url || "/placeholder.jpg";
  const hoverImage = product.images?.[1]?.url || defaultImage;
  const price = product.variants?.[0]?.price;

  // Map product to the shape WishlistButton expects
  const productForWishlist = {
    id: product.id ?? product.handle,
    handle: product.handle,
    title: product.title,
    featuredImage: { url: defaultImage },
    images: [{ url: defaultImage }, { url: hoverImage }],
    priceRange: price
      ? {
          maxVariantPrice: {
            amount: price.amount,
            currencyCode: price.currencyCode,
          },
        }
      : undefined,
    variants: product.variants,
  };

  const handleMouseEnter = () => {
    if (!defaultImageRef.current || !hoverImageRef.current) return;

    defaultImageRef.current.style.transform = "scale(1.2)";
    defaultImageRef.current.style.opacity = "0";
    defaultImageRef.current.style.transition =
      "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)";

    hoverImageRef.current.style.transform = "scale(1.15)";
    hoverImageRef.current.style.opacity = "1";
    hoverImageRef.current.style.transition =
      "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)";

    if (nameRef.current) {
      nameRef.current.style.color = "#888888";
      nameRef.current.style.transition =
        "color 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
    }
  };

  const handleMouseLeave = () => {
    if (!defaultImageRef.current || !hoverImageRef.current) return;

    defaultImageRef.current.style.transform = "scale(1)";
    defaultImageRef.current.style.opacity = "1";

    hoverImageRef.current.style.transform = "scale(1.2)";
    hoverImageRef.current.style.opacity = "0";

    if (nameRef.current) {
      nameRef.current.style.color = "#888888";
    }
  };

  return (
    <Link
      href={`/product/${product.handle}`}
      className="cursor-pointer block select-none"
      draggable={false}
    >
      <div
        ref={itemRef}
        className="cursor-pointer relative select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="relative w-full aspect-3/4 overflow-hidden">
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
            src={defaultImage}
            alt={product.title}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />
          <Image
          height={500}
          width={500}
            ref={hoverImageRef}
            src={hoverImage}
            alt={`${product.title} Detail`}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover opacity-0 scale-[1.2] pointer-events-none select-none"
          />
        </div>

        <h3
          ref={nameRef}
          className="mt-6 text-lg font-light tracking-wide uppercase text-neutral-500 pointer-events-none select-none"
        >
          {product.title}
        </h3>

        {price && (
          <p className="mt-2 text-sm text-neutral-600 tracking-wider pointer-events-none select-none">
            {price.amount} {price.currencyCode}
          </p>
        )}
      </div>
    </Link>
  );
};

export default function CollectionSwiperComponent({ products }) {
  const sliderRef = useRef(null);

  const handlePrev = () => {
    sliderRef.current?.goToPrev();
  };

  const handleNext = () => {
    sliderRef.current?.goToNext();
  };

  return (
    <div className="relative">
      <SmoothySlider
        ref={sliderRef}
        className="py-4 cursor-grab active:cursor-grabbing"
        config={{ infinite: true, snap: true }}
      >
        {products.map((product, index) => (
          <Slide
            key={product.id || index}
            className="w-[80vw] md:w-[30vw] px-3 md:px-6"
          >
            <ProductItemInCollection product={product} />
          </Slide>
        ))}
      </SmoothySlider>

      {/* Navigation buttons */}
      <button
        onClick={handlePrev}
        className="group absolute left-2 md:left-[5%] cursor-pointer top-1/2 z-10 -translate-y-1/2 w-12 h-12 rounded-full bg-black backdrop-blur-sm flex items-center justify-center transition-all  duration-300  hover:bg-white overflow-hidden"
        aria-label="Previous slide"
      >
        <div className="translate-x-[150%] group-hover:translate-x-0 transition-transform duration-300">
          <ChevronLeft color="black" className="w-6 h-6" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:-translate-x-[250%] transition-transform duration-300"> 
          <ChevronLeft color="white" className="w-6 h-6" />
        </div>
      </button>

      <button
        onClick={handleNext}
        className="group absolute right-2 md:right-[5%] cursor-pointer top-1/2 z-10 -translate-y-1/2 w-12 h-12 rounded-full bg-black backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white overflow-hidden"
        aria-label="Next slide"
      >
        <div className="-translate-x-[150%] group-hover:translate-x-0 transition-transform duration-300">
          <ChevronRight color="black" className="w-6 h-6" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:translate-x-[250%] transition-transform duration-300"> 
          <ChevronRight color="white" className="w-6 h-6" />
        </div>
      </button>
    </div>
  );
}
