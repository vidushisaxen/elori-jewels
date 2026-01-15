'use client';

import Link from 'next/link';
import WishlistButton from './WishlistButton';
import Image from 'next/image';


export default function RelatedProductsGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      {products.slice(0, 4).map((product) => (
        <Link
          key={product.handle}
          href={`/product/${product.handle}`}
          className="group block"
        >
          <div className="relative overflow-hidden bg-zinc-100 aspect-square mb-4">
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
                  id: product.id,
                  handle: product.handle,
                  title: product.title,
                  variants: product.variants,
                  priceRange: product.priceRange,
                  images: (product.images?.length
                    ? product.images
                    : product.featuredImage
                      ? [product.featuredImage]
                      : []
                  ).map((img: any) => ({
                    url: img.url,
                    altText: img.altText ?? product.title
                  }))
                } as any}
              />
            </div>

            {product.featuredImage?.url ? (
              <Image height={500} width={500} src={product.featuredImage.url}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
            ) : (
              <div className="h-full w-full bg-zinc-200 flex items-center justify-center">
                <span className="text-zinc-400 text-sm">No image</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-light uppercase tracking-wide text-black">
              {product.title}
            </h3>
            <p className="text-sm font-light text-zinc-800">
              {product.priceRange.maxVariantPrice.amount}{' '}
              {product.priceRange.maxVariantPrice.currencyCode}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
