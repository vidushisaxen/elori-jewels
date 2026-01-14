import React, { Suspense } from 'react';
import Link from 'next/link';
import { getCollectionProducts } from '../app/lib/shopify';
import JewelryItemClient from './Jewellery';

async function JewelrySectionContent() {
  let jewelryItems = [];

  try {
    // Fetch necklaces from Shopify collection - pass handle string directly
    const products = await getCollectionProducts('rings');

    console.log('Fetched products:', products.length);

    jewelryItems = products.map((product) => ({
      name: product.title,
      price: `${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`,
      defaultImage: product.images?.[0]?.url || 'https://via.placeholder.com/600x800',
      hoverImage: product.images?.[1]?.url || product.images?.[0]?.url || 'https://via.placeholder.com/600x800',
      handle: product.handle
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  // Fallback if no products found
  if (jewelryItems.length === 0) {
    jewelryItems = [
      {
        name: 'Minimal Ring',
        price: '$85',
        defaultImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop',
        hoverImage: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=800&fit=crop',
        handle: 'minimal-ring'
      },
    ];
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1EFEA] px-6 py-20">
      <div className="w-full max-w-7xl">
        <h1 className="text-xs uppercase tracking-wider text-black/60 text-center mb-10">
          Rings Collection
        </h1>
        
        <JewelryItemClient items={jewelryItems} />

        <div className="text-center mt-12 flex items-center justify-center">
        <div className="text-center mt-12 flex items-center justify-center">
          <Link
            href="/collection/rings"
            className="cursor-pointer h-fit group space-y-1 relative w-fit"
          >
            <div className="uppercase overflow-hidden relative z-10 text-xs w-20 tracking-widest ">
              <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300 ">Shop Now</p>
              <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300 ">Shop Now</span>
            </div>
            <span className="w-full rounded-full relative block h-[2px] bg-black/20 ">
              <span className="w-0 h-full bg-black absolute left-0 top-0 transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </span>
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function Rings() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F1EFEA] flex items-center justify-center">
        <div className="text-lg font-light tracking-widest text-black/60">Loading...</div>
      </div>
    }>
      <JewelrySectionContent />
    </Suspense>
  );
}