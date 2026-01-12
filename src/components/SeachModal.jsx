import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useLenis } from 'lenis/react'


// SearchModal Component - Export this to use in your Header
export const SearchModal = ({ isOpen, onClose, products, collections }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
const lenis = useLenis();
  
    useEffect(() => {
      if (!lenis) return;
  
      if (isOpen) {
        lenis.stop();   
      } else {
        lenis.start(); 
      }
  
      return () => {
        
        lenis.start();
      };
    }, [isOpen, lenis]);
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        
        // Search in title
        const titleMatch = product.title?.toLowerCase().includes(searchLower);
        
        // Search in tags
        const tagsMatch = product.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        
        // Search in product type
        const typeMatch = product.productType?.toLowerCase().includes(searchLower);
        
        // Search in vendor
        const vendorMatch = product.vendor?.toLowerCase().includes(searchLower);
        
        return titleMatch || tagsMatch || typeMatch || vendorMatch;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const handleSuggestedClick = (term) => {
    setSearchTerm(term);
  };

  const handleClose = () => {
    setSearchTerm('');
    setFilteredProducts([]);
    onClose();
  };

  const suggestedTerms = ['RINGS', 'NECKLACES', 'EARRINGS', 'BRACELETS', 'ENGAGEMENT'];

  return (
    <div
      className={`fixed inset-0 z-[999] transition-all duration-500 min-h-screen ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        className={`absolute top-0 left-0 right-0 bg-stone-50 transition-transform duration-500 ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute cursor-pointer top-6 right-6 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Brand Name */}
          <div className="text-2xl font-serif tracking-wider text-center mb-12">
            ELORI JEWELS
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Enter Search Term"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b border-stone-300 pl-8 pr-4 py-3 text-lg focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400"
              autoFocus
            />
          </div>

          {/* Suggested Terms - Only show when not searching */}
          {!searchTerm && (
            <div className="mb-12">
              <div className="text-xs text-stone-500 tracking-wider mb-4">SUGGESTED TERMS:</div>
              <div className="flex flex-wrap gap-4">
                {suggestedTerms.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestedClick(term)}
                    className="text-sm text-stone-400 hover:text-stone-900 transition-colors tracking-wider"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Featured Collections - Only show when not searching */}
          {!searchTerm && collections && collections.length > 0 && (
            <div>
              <h2 className="text-3xl font-serif mb-8 text-center">
                Looking for something more...
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {collections.slice(0, 3).map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collection/${collection.handle}`}
                    className="group cursor-pointer"
                    onClick={handleClose}
                  >
                    <div className="aspect-square bg-stone-200 overflow-hidden mb-4">
                      {collection.image ? (
                        <img
                          src={collection.image.url || collection.image.src || collection.image}
                          alt={collection.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <span className="text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif text-xl text-center">{collection.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search Results - Only show when searching */}
          {searchTerm && (
            <div>
              {filteredProducts.length > 0 ? (
                <>
                  <h2 className="text-2xl font-serif mb-6">
                    Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-h-[500px] overflow-y-auto pr-2">
                    {filteredProducts.map((product) => {
                      // Handle different image structures from Shopify
                      const imageUrl = product.featuredImage?.url || 
                                     product.featuredImage?.src ||
                                     product.images?.[0]?.url ||
                                     product.images?.[0]?.src ||
                                     product.image;
                      
                      // Handle price from variants
                      const price = product.variants?.[0]?.price || 
                                   product.priceRange?.minVariantPrice?.amount ||
                                   product.price;

                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.handle}`}
                          className="group cursor-pointer"
                          onClick={handleClose}
                        >
                          <div className="aspect-square bg-stone-200 overflow-hidden mb-3">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <h3 className="font-serif text-sm mb-1 line-clamp-2">{product.title}</h3>
                          {price && (
                            <p className="text-stone-600 text-sm">
                              ${typeof price === 'string' ? price : Number(price).toFixed(2)}
                            </p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-stone-500 text-lg mb-2">No products found</p>
                  <p className="text-stone-400 text-sm">Try searching for something else</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};