import Link from "next/link";
import CollectionSwiperComponent from "../../components/CollectionSwiperComponent";
import { getAllCollections, getCollectionProducts } from "../lib/shopify";

export const metadata = {
  title: "Products · Noir Jewels",
  description: "Browse our collection of minimal jewellery pieces",
};

export default async function ProductsPage() {
  const collections = await getAllCollections();
  
  if (!collections || collections.length === 0) {
    return (
      <section className="bg-white px-6 py-16 text-center">
        <p className="text-zinc-600">No collections found.</p>
      </section>
    );
  }

  // Fetch products for each collection
  const collectionsWithProducts = await Promise.all(
    collections.map(async (collection) => {
      const products = await getCollectionProducts(collection.handle);
      return {
        ...collection,
        products: products || []
      };
    })
  );

  return (
    <>
    <section className="bg-white px-6 py-16 mt-20">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-16 text-center text-4xl font-light tracking-tight">
          Our Collections
        </h1>

        {/* Collections with Product Swipers */}
        {collectionsWithProducts.map((collection) => (
  <div key={collection.id} className="mb-24">
    {/* Collection Header */}
    <div className="mb-8 text-center">
      <h2 className="text-3xl font-light tracking-wide uppercase text-neutral-700">
        {collection.title}
      </h2>

      {collection.description && (
        <p className="mt-3 text-sm text-neutral-500 max-w-2xl mx-auto">
          {collection.description}
        </p>
      )}

      {/* View All Button */}
      <div className="mt-6">
        <Link
          href={`/collection/${collection.handle}`}
          className="inline-block cursor-pointer text-sm uppercase tracking-wider text-neutral-700 hover:text-black transition-colors border-b border-neutral-400 hover:border-black"
        >
          View all
        </Link>
      </div>
    </div>

    {/* Collection Products Swiper */}
    {collection.products.length > 0 ? (
      <CollectionSwiperComponent products={collection.products} />
    ) : (
      <p className="text-center text-sm text-zinc-400 py-12">
        No products in this collection yet.
      </p>
    )}
  </div>
))}

      </div>
    </section>
    </>
  );
}