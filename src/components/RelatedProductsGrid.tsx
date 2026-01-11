'use client';

import Link from 'next/link';
import WishlistButton from './WishlistButton';


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
            {/* ✅ Wishlist button */}
            <div className="absolute top-3 right-3 z-30 pointer-events-auto">
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
              <img
                src={product.featuredImage.url}
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
