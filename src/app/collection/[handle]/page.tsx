import Link from "next/link";
import { getCollection, getCollectionProducts } from "../../lib/shopify";
import { notFound } from "next/navigation";
import ProductsGridClient from '../../../components/ProductsGridClient'

export async function generateMetadata({ params }) {
  const { handle } = await params;
  
  try {
    const collection = await getCollection(handle);
    
    if (!collection) {
      return {
        title: "Collection Not Found · Elori Jewels",
      };
    }
    
    return {
      title: `${collection.title} · Elori Jewels`,
      description: collection.description || `Browse our ${collection.title} collection`,
    };
  } catch (error) {
    return {
      title: "Collection · Elori Jewels",
      description: "Browse our collection",
    };
  }
}



  function truncateBySentences(text, sentenceCount = 2) {
  if (!text) return "";

  const sentences = text
    .split('.')
    .filter(sentence => sentence.trim().length > 0);

  if (sentences.length <= sentenceCount) {
    return text;
  }

  return sentences.slice(0, sentenceCount).join('. ') + '.';
}


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
    <section className="bg-white px-8 py-16 mt-15">
      <div className="mx-auto ">
        {/* Collection Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-light tracking-tight uppercase text-neutral-800">
            {collection.title}
          </h1>
          {collection.description && (
  <p className="mt-4 text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
    {truncateBySentences(collection.description, 2)}
  </p>
)}
         
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
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