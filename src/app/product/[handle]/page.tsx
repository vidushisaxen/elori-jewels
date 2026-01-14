import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Gallery } from '../../../components/product/gallery';
import { ProductProvider } from '../../../components/product/product-context';
import { HIDDEN_PRODUCT_TAG } from '../../lib/constants';
import { getProduct, getProductRecommendations } from '../../lib/shopify';
import { Image } from '../../lib/shopify/types';
import WishlistButton from '../../../components/WishlistButton';
import RelatedProductsGrid from '../../../components/RelatedProductsGrid';
import { AddToCart } from '../../../components/cart/add-to-cart';

// export async function generateMetadata(props: {
//   params: Promise<{ handle: string }>;
// }): Promise<Metadata> {
//   const { handle } = await props.params;

//   const product = await getProduct(handle);
//   if (!product) return notFound();

//   const { url, width, height, altText: alt } = product.featuredImage || {};
//   const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

//   return {
//     title: product.seo?.title || product.title,
//     description: product.seo?.description || product.description,
//     robots: {
//       index: indexable,
//       follow: indexable,
//       googleBot: { index: indexable, follow: indexable }
//     },
//     openGraph: url ? { images: [{ url, width, height, alt }] } : undefined
//   };
// }


export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await props.params;

  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductPageContent handle={handle} />
    </Suspense>
  );
}


async function ProductPageContent({ handle }: { handle: string }) {
  const product = await getProduct(handle);

  if (!product) return notFound();

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount
    }
  };

  return (
    <ProductProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      
      <div className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Scrollable Gallery (50%) */}
          <div className="relative bg-zinc-50">
            <Suspense
              fallback={
                <div className="relative w-full h-screen bg-zinc-100" />
              }
            >
              <Gallery
                images={product.images.map((image: Image) => ({
                  src: image.url,
                  altText: image.altText
                }))}
              />
            </Suspense>
          </div>

          {/* Right Side - Sticky Product Details (50%) */}
          <div className="lg:sticky lg:top-20 lg:h-screen lg:overflow-y-auto px-8 py-12 lg:px-16 lg:py-20">
            <div className="max-w-2xl">
              <div className='w-full flex gap-5 justify-between items-start'>
                {/* Product Title */}
                <h1 className="text-3xl lg:text-4xl font-light uppercase tracking-wide mb-4">
                  {product.title}
                </h1>
                <div 
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 shrink-0"
                >
                  <WishlistButton product={product} />
                </div>
              </div>

              {/* Product Subtitle/Type */}
              <p className="text-sm text-zinc-600 uppercase tracking-wider mb-6">
                {'18 Karat White Gold'}
              </p>

              {/* Price */}
              <p className="text-2xl font-light mb-8">
                {product.priceRange.maxVariantPrice.currencyCode} {product.priceRange.maxVariantPrice.amount} 
              </p>

              {/* Estimated Dispatch */}
              <p className="text-xs uppercase tracking-wider text-amber-600 mb-8">
                Estimated Dispatch: Friday, January 9th
              </p>

              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                <AddToCart product={product} />
                <button className="w-full bg-amber-600 text-white py-4 px-8 text-sm uppercase tracking-widest hover:bg-amber-700 transition-colors">
                  Buy Now
                </button>
              </div>

              {/* Tabs */}
              <div className="border-t border-zinc-200 pt-8">
                <div className="flex gap-8 mb-6 text-sm uppercase tracking-wider overflow-x-auto">
                  <button className="border-b-2 border-black pb-2 whitespace-nowrap">Description</button>
                  <button className="text-zinc-400 pb-2 hover:text-black transition-colors whitespace-nowrap">Details</button>
                  <button className="text-zinc-400 pb-2 hover:text-black transition-colors whitespace-nowrap">Materials & Care</button>
                  <button className="text-zinc-400 pb-2 hover:text-black transition-colors whitespace-nowrap">Packaging</button>
                </div>

                {/* Description Content */}
                <div className="text-sm leading-relaxed text-zinc-700">
                  <p>{product.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="px-8 lg:px-16">
          <RelatedProducts id={product.id} />
        </div>
      </div>
    </ProductProvider>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <div className="bg-zinc-200" />
      <div className="px-16 py-20">
        <div className="h-8 bg-zinc-200 rounded w-3/4 mb-4" />
        <div className="h-6 bg-zinc-200 rounded w-1/2" />
      </div>
    </div>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  const relatedProducts = await getProductRecommendations(id);

  if (!relatedProducts.length) return null;

  return (
    <div className="py-16 border-t border-zinc-200">
      <h2 className="mb-8 text-2xl font-light uppercase tracking-tight">
        Related Products
      </h2>
      <RelatedProductsGrid products={relatedProducts} />
    </div>
  );
}