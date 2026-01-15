import React, { Suspense } from 'react';
import Link from 'next/link';
import { getCollectionProducts } from '../app/lib/shopify';
import JewelryItemClient from './Jewellery';
import LinkButton from './Buttons/LinkButton';

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
    <div className="min-h-screen flex items-center justify-center bg-[#F1EFEA] py-40">
      <div className="w-full">
        <h1 className="text-xs uppercase tracking-wider text-black/60 text-center mb-10">
          Rings Collection
        </h1>
        
        <JewelryItemClient items={jewelryItems} />
        <LinkButton href={"/collection/rings"} text={"Shop Now"}/>
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