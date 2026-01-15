'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WishlistButton from '../components/WishlistButton';
import SmoothySlider, { Slide, SmoothySliderRef } from './SmoothySlider';

const JewelryItem = ({ item }: { item: any }) => {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const defaultImageRef = useRef<HTMLImageElement | null>(null);
  const hoverImageRef = useRef<HTMLImageElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);

  const handleMouseEnter = () => {
    if (!defaultImageRef.current || !hoverImageRef.current) return;

    defaultImageRef.current.style.transform = 'scale(1.2)';
    defaultImageRef.current.style.opacity = '0';
    defaultImageRef.current.style.transition =
      'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';

    hoverImageRef.current.style.transform = 'scale(1.15)';
    hoverImageRef.current.style.opacity = '1';
    hoverImageRef.current.style.transition =
      'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';

    if (nameRef.current) {
      nameRef.current.style.color = '#888888';
      nameRef.current.style.transition =
        'color 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    }
  };

  const handleMouseLeave = () => {
    if (!defaultImageRef.current || !hoverImageRef.current) return;

    defaultImageRef.current.style.transform = 'scale(1)';
    defaultImageRef.current.style.opacity = '1';

    hoverImageRef.current.style.transform = 'scale(1.2)';
    hoverImageRef.current.style.opacity = '0';

    if (nameRef.current) {
      nameRef.current.style.color = '#888888';
    }
  };

  const productForWishlist = {
    id: item.id ?? item.handle,
    handle: item.handle,
    title: item.name,
    featuredImage: { url: item.defaultImage },
    images: [
      { url: item.defaultImage },
      { url: item.hoverImage || item.defaultImage }
    ],
    variants: item.variantId ? [{ id: item.variantId }] : undefined
  };

  return (
    <Link 
      href={`/product/${item.handle}`} 
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
        <div className="relative w-full aspect-square overflow-hidden">
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

          <img
            ref={defaultImageRef}
            src={item.defaultImage}
            alt={item.name}
            draggable={false}
            className="absolute pointer-events-none inset-0 w-full h-full object-cover select-none"
          />
          <img
            ref={hoverImageRef}
            src={item.hoverImage || item.defaultImage}
            alt={`${item.name} Detail`}
            draggable={false}
            className="absolute inset-0 pointer-events-none w-full h-full object-cover opacity-0 scale-[1.2] select-none"
          />
        </div>

        <h3
          ref={nameRef}
          className="mt-6 text-lg pointer-events-none font-light uppercase text-neutral-500 select-none"
        >
          {item.name}
        </h3>
        <p className="mt-2 text-sm pointer-events-none text-neutral-600 tracking-wider select-none">
          {item.price}
        </p>
      </div>
    </Link>
  );
};

export default function JewelryItemClient({ items }: { items: any[] }) {
  const sliderRef = useRef<SmoothySliderRef>(null);

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
        className="py-4 md:px-0 w-screen  cursor-grab active:cursor-grabbing"
        config={{ infinite: true, snap: false }}
      >
        {items.map((item, index) => (
          <Slide
            key={item.id || index}
            className="w-[80vw] md:w-[30vw] px-3 "
          >
            <JewelryItem item={item} />
          </Slide>
        ))}
      </SmoothySlider>

      {/* Navigation buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-2 md:left-[5%] cursor-pointer top-1/2 z-999 -translate-y-1/2 w-12 h-12 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-black/20 "
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 md:right-[5%] cursor-pointer top-1/2 z-999 -translate-y-1/2 w-12 h-12 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-black/20 "
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
