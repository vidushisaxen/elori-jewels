import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense} from 'react';
import { Gallery } from '../../../components/product/gallery';
import { ProductProvider } from '../../../components/product/product-context';
import { HIDDEN_PRODUCT_TAG } from '../../lib/constants';
import { getProduct, getProductRecommendations } from '../../lib/shopify';
import { Image } from '../../lib/shopify/types';
import WishlistButton from '../../../components/WishlistButton';
import RelatedProductsGrid from '../../../components/RelatedProductsGrid';
import { AddToCart } from '../../../components/cart/add-to-cart';


export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable
      }
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt
            }
          ]
        }
      : null
  };
}

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductPageContent params={props.params} />
    </Suspense>
  );
}

async function ProductPageContent({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.handle);

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
            <div className="max-w-2xl  ">
              <div className='w-full flex gap-5 justify-between'>
              {/* Product Title */}
              <h1 className="text-3xl lg:text-4xl font-light uppercase tracking-wide mb-4">
                {product.title}
              </h1>
              <div>
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

              {/* Variants/Options (if any) */}
              {/* {product.options?.map((option: any) => (
                <div key={option.id} className="mb-6">
                  <label className="block text-sm uppercase tracking-wider text-zinc-700 mb-3">
                    {option.name}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value: string) => (
                      <button
                        key={value}
                        className="px-4 py-2 border border-zinc-300 text-sm uppercase tracking-wide hover:border-black transition-colors"
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))} */}

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

// async function RelatedProducts({ id }: { id: string }) {
//   const relatedProducts = await getProductRecommendations(id);

//   if (!relatedProducts.length) return null;

//   return (
//     <div className="py-16 border-t border-zinc-200">
//       <h2 className="mb-8 text-2xl font-light uppercase tracking-tight">
//         Related Products
//       </h2>
//       <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
//         {relatedProducts.slice(0, 4).map((product) => (
//           <Link
//             key={product.handle}
//             href={`/product/${product.handle}`}
//             className="group"
//           >
//             <div className="relative overflow-hidden bg-zinc-100 aspect-square mb-4">
//               {product.featuredImage?.url ? (
//                 <img
//                   src={product.featuredImage.url}
//                   alt={product.title}
//                   className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
//                 />
//               ) : (
//                 <div className="h-full w-full bg-zinc-200 flex items-center justify-center">
//                   <span className="text-zinc-400 text-sm">No image</span>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-2">
//               <h3 className="text-sm font-light uppercase tracking-wide text-black">
//                 {product.title}
//               </h3>
//               <p className="text-sm font-light text-zinc-800">
//                 {product.priceRange.maxVariantPrice.amount} {product.priceRange.maxVariantPrice.currencyCode}
//               </p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

async function RelatedProducts({ id }: { id: string }) {
  const relatedProducts = await getProductRecommendations(id);

  if (!relatedProducts.length) return null;

  return (
    <div className="py-16 border-t border-zinc-200">
      <h2 className="mb-8 text-2xl font-light uppercase tracking-tight">
        Related Products
      </h2>

      {/* ✅ Client component renders wishlist buttons */}
      <RelatedProductsGrid products={relatedProducts} />
    </div>
  );
}