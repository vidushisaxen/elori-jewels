"use client"
import React, { useRef, useEffect, Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';
import WishlistButton from './WishlistButton';

const JewelryItem = ({ item }) => {
  const itemRef = useRef(null);
  const defaultImageRef = useRef(null);
  const hoverImageRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const item = itemRef.current;
    const defaultImg = defaultImageRef.current;
    const hoverImg = hoverImageRef.current;
    const name = nameRef.current;

    const handleMouseEnter = () => {
      defaultImg.style.transform = 'scale(1.2)';
      defaultImg.style.opacity = '0';
      defaultImg.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
      
      hoverImg.style.transform = 'scale(1.15)';
      hoverImg.style.opacity = '1';
      hoverImg.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
      
      name.style.color = '#888888';
      name.style.transition = 'color 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    };

    const handleMouseLeave = () => {
      defaultImg.style.transform = 'scale(1)';
      defaultImg.style.opacity = '1';
      
      hoverImg.style.transform = 'scale(1.2)';
      hoverImg.style.opacity = '0';
      
      name.style.color = '#888888';
    };

    item.addEventListener('mouseenter', handleMouseEnter);
    item.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      item.removeEventListener('mouseenter', handleMouseEnter);
      item.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Link href={`/product/${item.handle}`} className="cursor-pointer block">
      <div
        ref={itemRef}
        className="cursor-pointer relative"
       
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
            <WishlistButton
              product={{
                id: item.id,
                handle: item.handle,
                title: item.name,
                variants: item.variants,
                priceRange: {
                  maxVariantPrice: {
                    amount: String(item.priceAmount ?? item.price).replace(/[^\d.]/g, ''),
                    currencyCode: item.currencyCode ?? 'INR'
                  }
                },
                images: [
                  { url: item.defaultImage, altText: item.name },
                  ...(item.hoverImage ? [{ url: item.hoverImage, altText: `${item.name} hover` }] : [])
                ]
              }}
            />
          </div>

          <img
            ref={defaultImageRef}
            src={item.defaultImage}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img
            ref={hoverImageRef}
            src={item.hoverImage}
            alt={`${item.name} Detail`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 scale-[1.2]"
          />
        </div>

        <h3 ref={nameRef} className="mt-6 text-lg font-light uppercase text-neutral-500">
          {item.name}
        </h3>
        <p className="mt-2 text-sm text-neutral-600 tracking-wider">{item.price}</p>
      </div>
    </Link>
  );
};
const JewelrySectionContent = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const jewelryItems = [
    {
       id: 'minimal-ring',
    handle: 'minimal-ring',
    name: 'Minimal Ring',
    priceAmount: '85',
    currencyCode: 'INR',
    price: 'INR 85',
      defaultImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=800&fit=crop'
    },
    {
      name: 'Lunar Pendant',
       id: 'lunar-pendant',
    handle: 'lunar-pendant',
    name: 'Lunar Pendant',
    priceAmount: '120',
    currencyCode: 'INR',
    price: 'INR 120',
      defaultImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop'
    },
    {
       id: 'chain-bracelet',
    handle: 'chain-bracelet',
    priceAmount: '95',
    currencyCode: 'INR',
    price: 'INR 95',
      name: 'Chain Bracelet',
      defaultImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop'
    },
    {
       id: 'pearl-drops',
    handle: 'pearl-drops',
    priceAmount: '110',
    currencyCode: 'INR',
    price: 'INR 110',
      name: 'Pearl Drops',
      defaultImage: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&h=800&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=800&fit=crop'
    },
    {
       id: 'diamond-stud',
    handle: 'diamond-stud',
    priceAmount: '150',
    currencyCode: 'INR',
    price: 'INR 150',
      name: 'Diamond Stud',
      defaultImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop'
    },
    {
       id: 'gold-band',
    handle: 'gold-band',
    priceAmount: '140',
    currencyCode: 'INR',
    price: 'INR 140',
      name: 'Gold Band',
      defaultImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
      hoverImage: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&h=800&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1EFEA] px-6 py-20">
      <div className="w-full max-w-7xl">
        <h1 className="text-xs uppercase tracking-wider text-black/60 text-center mb-10">
          Handmade Jewelry
        </h1>
        
        <div className="relative">
          <style jsx>{`
            .swiper-pagination-bullet {
              width: 4px;
              height: 4px;
              background: rgba(255, 255, 255, 0.3);
              opacity: 1;
              transition: all 0.3s;
              border-radius: 2px;
            }
            .swiper-pagination-bullet-active {
              width: 32px;
              background: white;
            }
          `}</style>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={48}
            slidesPerView={1}
            loop={true}
            speed={800}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            pagination={{
              clickable: true,
              dynamicBullets: false,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 48,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 48,
              },
            }}
            className="pb-16"
          >
            {jewelryItems.map((item, index) => (
              <SwiperSlide key={index}>
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
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-15 cursor-pointer  w-12 h-12 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-100 hover:bg-white/20 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

           <div className="text-center mt-12 flex items-center justify-center">
        <Link href="/products" className='cursor-pointer w-fit'>
          <div className="uppercase text-xs w-20 tracking-widest border-b border-black pb-1">
            Shop Now
          </div>
        </Link>
      </div>
        </div>
      </div>
    </div>
  );
};

export default function JewelrySection() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-lg font-light tracking-widest">Loading...</div>
      </div>
    }>
      <JewelrySectionContent />
    </Suspense>
  );
}