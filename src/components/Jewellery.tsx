'use client';

import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import WishlistButton from '../components/WishlistButton'

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

  // ✅ Map your `item` to the shape WishlistButton expects
  // (Your WishlistButton should store id/handle/title/images/price/variantId etc.)
  const productForWishlist = {
  id: item.id ?? item.handle,   // ✅ fallback
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
    <Link href={`/product/${item.handle}`} className="cursor-pointer block">
      <div
        ref={itemRef}
        className="cursor-pointer relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full aspect-3/4 overflow-hidden">
          {/* ✅ WishlistButton (same position) */}
          <div className="absolute top-4 right-4 z-10">
            <WishlistButton product={productForWishlist} />
          </div>

          <img
            ref={defaultImageRef}
            src={item.defaultImage}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img
            ref={hoverImageRef}
            src={item.hoverImage || item.defaultImage}
            alt={`${item.name} Detail`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 scale-[1.2]"
          />
        </div>

        <h3
          ref={nameRef}
          className="mt-6 text-lg font-light uppercase text-neutral-500"
        >
          {item.name}
        </h3>
        <p className="mt-2 text-sm text-neutral-600 tracking-wider">
          {item.price}
        </p>
      </div>
    </Link>
  );
};

export default function JewelryItemClient({ items }: { items: any[] }) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={48}
        slidesPerView={1}
        loop={true}
        speed={800}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current
        }}
        onBeforeInit={(swiper) => {
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 48 },
          1024: { slidesPerView: 3, spaceBetween: 48 }
        }}
        className="pb-16"
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            <JewelryItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        ref={prevRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 w-12 h-12 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-100 hover:bg-white/20 z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        ref={nextRef}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-15 cursor-pointer w-12 h-12 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-100 hover:bg-white/20 z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
