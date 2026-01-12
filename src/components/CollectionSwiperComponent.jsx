'use client';

import React, { useRef, useState ,useEffect} from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductItemInCollection = ({ product }) => {
  const itemRef = useRef(null);
  const defaultImageRef = useRef(null);
  const hoverImageRef = useRef(null);
  const nameRef = useRef(null);

  const [isWishlisted, setIsWishlisted] = useState(false);

  const defaultImage = product.images?.[0]?.url || '/placeholder.jpg';
  const hoverImage = product.images?.[1]?.url || defaultImage;
  const price = product.variants?.[0]?.price;

  const readWishlist = () => {
    try {
      const raw = localStorage.getItem('wishlist');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeWishlist = (items) => {
    localStorage.setItem('wishlist', JSON.stringify(items));
    // ✅ update header + any other listeners instantly
    window.dispatchEvent(new Event('wishlist:changed'));
  };

  // ✅ hydrate heart state from localStorage (so it stays filled after reload)
  useEffect(() => {
    const wishlist = readWishlist();
    setIsWishlisted(wishlist.some((item) => item.id === product.id));
  }, [product.id]);

  // ✅ also keep in sync if wishlist changes elsewhere
  useEffect(() => {
    const sync = () => {
      const wishlist = readWishlist();
      setIsWishlisted(wishlist.some((item) => item.id === product.id));
    };

    const onStorage = (e) => {
      if (e.key === 'wishlist') sync();
    };

    window.addEventListener('wishlist:changed', sync);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('wishlist:changed', sync);
      window.removeEventListener('storage', onStorage);
    };
  }, [product.id]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const wishlist = readWishlist();
    const exists = wishlist.some((item) => item.id === product.id);

    if (exists) {
      // ✅ remove
      const updated = wishlist.filter((item) => item.id !== product.id);
      writeWishlist(updated);
      setIsWishlisted(false);
      return;
    }

    // ✅ add (NO DUPLICATES)
    const newItem = {
      id: product.id,
      handle: product.handle,
      name: product.title,
      // store price in the same format your wishlist page uses
      price: price ? `${price.amount} ${price.currencyCode}` : '',
      defaultImage,
      hoverImage,
      // strongly recommended for "add to cart from wishlist"
      variantId: product.variants?.[0]?.id
    };

    writeWishlist([...wishlist, newItem]);
    setIsWishlisted(true);
  };

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

  return (
    <Link href={`/product/${product.handle}`} className="cursor-pointer block">
      <div
        ref={itemRef}
        className="cursor-pointer relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full aspect-3/4 overflow-hidden">
          <button
            type="button"
            onClick={handleWishlistClick}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                isWishlisted
                  ? 'fill-red-500 stroke-red-500'
                  : 'stroke-zinc-700 hover:stroke-red-500'
              }`}
            />
          </button>

          <img
            ref={defaultImageRef}
            src={defaultImage}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img
            ref={hoverImageRef}
            src={hoverImage}
            alt={`${product.title} Detail`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 scale-[1.2]"
          />
        </div>

        <h3
          ref={nameRef}
          className="mt-6 text-lg font-light tracking-wide uppercase text-neutral-500"
        >
          {product.title}
        </h3>

        {price && (
          <p className="mt-2 text-sm text-neutral-600 tracking-wider">
            {price.amount} {price.currencyCode}
          </p>
        )}
      </div>
    </Link>
  );
};



export default function CollectionSwiperComponent({ products }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

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
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        // pagination={{
        //   clickable: true,
        //   dynamicBullets: false,
        // }}
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
        {products.map((product, index) => (
          <SwiperSlide key={product.id || index}>
            <ProductItemInCollection product={product} />
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