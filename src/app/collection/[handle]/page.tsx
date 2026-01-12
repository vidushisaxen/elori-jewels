import Link from "next/link";
import { getCollection, getCollectionProducts } from "../../lib/shopify";
import { notFound } from "next/navigation";
import ProductsGridClient from '../../../components/ProductsGridClient'

// export async function generateMetadata({ params }) {
//   const { handle } = await params;
  
//   try {
//     const collection = await getCollection(handle);
    
//     if (!collection) {
//       return {
//         title: "Collection Not Found · Elori Jewels",
//       };
//     }
    
//     return {
//       title: `${collection.title} · Elori Jewels`,
//       description: collection.description || `Browse our ${collection.title} collection`,
//     };
//   } catch (error) {
//     return {
//       title: "Collection · Elori Jewels",
//       description: "Browse our collection",
//     };
//   }
// }

export default async function CollectionPage({ params }) {
  const { handle } = await params;
  
  let collection = null;
  let products = [];

  try {
    collection = await getCollection(handle);
    
    if (!collection) {
      console.log(`Collection not found: ${handle}`);
      notFound();
    }
    
    products = await getCollectionProducts(handle);
  } catch (error) {
    console.error('Error fetching collection:', error);
    notFound();
  }

  return (
    <section className="bg-white px-8 py-16 mt-20">
      <div className="mx-auto ">
        {/* Collection Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-light tracking-tight uppercase text-neutral-800">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-4 text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              {collection.description}
            </p>
          )}
          {/* <div className="mt-2 text-xs text-neutral-400 tracking-wider">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </div> */}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          // <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          //   {products.map((product) => {
          //     const firstImage = product.images?.[0];
          //     const secondImage = product.images?.[1];
          //     const price = product.variants?.[0]?.price;
              
          //     return (
          //       <Link
          //         key={product.id}
          //         href={`/product/${product.handle}`}
          //         className="group"
          //       >
          //         <div className="relative overflow-hidden bg-zinc-100">
          //           {firstImage ? (
          //             <>
          //               <img
          //                 src={firstImage.url}
          //                 alt={firstImage.altText || product.title}
          //                 width={500}
          //                 height={500}
          //                 className="h-96 w-full object-cover transition-all duration-700 ease-out group-hover:opacity-0 group-hover:scale-110"
          //               />
          //               {secondImage && (
          //                 <img
          //                   src={secondImage.url}
          //                   alt={secondImage.altText || product.title}
          //                   width={500}
          //                   height={500}
          //                   className="absolute inset-0 h-96 w-full object-cover opacity-0 scale-110 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
          //                 />
          //               )}
          //             </>
          //           ) : (
          //             <div className="h-96 w-full bg-zinc-200 flex items-center justify-center">
          //               <span className="text-zinc-400 text-sm">No image</span>
          //             </div>
          //           )}
          //         </div>
          //         <div className="mt-4 space-y-2">
          //           <h3 className="text-sm font-light uppercase tracking-[0.2em] text-black transition-colors duration-300 group-hover:text-neutral-500">
          //             {product.title}
          //           </h3>
          //           {product.description && (
          //             <p className="text-xs text-zinc-600 line-clamp-2">
          //               {product.description}
          //             </p>
          //           )}
          //           {price && (
          //             <p className="text-sm font-light text-zinc-800">
          //               {price.amount} {price.currencyCode}
          //             </p>
          //           )}
          //         </div>
          //       </Link>
          //     );
          //   })}
          // </div>
          <ProductsGridClient products={products} defaultCols={4} />
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg font-light">No products found in this collection.</p>
            <Link 
              href="/products" 
              className="inline-block mt-6 px-8 py-3 text-sm font-light tracking-[0.15em] uppercase text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-all duration-300"
            >
              Browse All Collections
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}