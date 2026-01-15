'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import AnnouncementBar from "./AnnouncementsBar";
import { SearchModal } from "./SeachModal";
import { useLenis } from 'lenis/react';
import { useStore } from '../store';
import Image from "next/image";
import LinkButton from "./Buttons/LinkButton";

export default function Header() {
  const [hovered, setHovered] = useState(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [leftLinks, setLeftLinks] = useState([]);

  // Zustand store
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const hasHydrated = useStore((state) => state._hasHydrated);

  // Only show counts after hydration to prevent flicker
  const wishlistCount = hasHydrated ? wishlist.length : 0;
  const cartCount = hasHydrated ? (cart?.totalQuantity || 0) : 0;

  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    if (megaMenuOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }

    return () => {
      lenis.start();
    };
  }, [megaMenuOpen, lenis]);

  // Fetch products and collections from Shopify
  useEffect(() => {
    fetchShopifyData();
  }, []);

  // Stop Lenis when search modal is open
  useEffect(() => {
    if (isSearchOpen) {
      window.lenis?.stop();
    } else {
      window.lenis?.start();
    }
  }, [isSearchOpen]);

  const fetchShopifyData = async () => {
    try {
      const response = await fetch('/api/shopify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              collections(first: 250) {
                edges {
                  node {
                    id
                    title
                    handle
                    description
                    image {
                      url
                      altText
                    }
                    products(first: 5) {
                      edges {
                        node {
                          id
                          title
                          handle
                          featuredImage {
                            url
                            altText
                          }
                          variants(first: 1) {
                            edges {
                              node {
                                priceV2 {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              products(first: 250) {
                edges {
                  node {
                    id
                    title
                    handle
                    tags
                    productType
                    vendor
                    featuredImage {
                      url
                      altText
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          priceV2 {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.data) {
        console.error('Invalid response structure:', data);
        return;
      }

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return;
      }

      // Transform products
      const productsData = data.data.products.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        tags: edge.node.tags,
        productType: edge.node.productType,
        vendor: edge.node.vendor,
        featuredImage: edge.node.featuredImage,
        variants: edge.node.variants.edges.map(v => ({
          price: v.node.priceV2.amount,
          currencyCode: v.node.priceV2.currencyCode
        })),
      }));

      // Transform collections with their top 5 products
      const collectionsData = data.data.collections.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        description: edge.node.description,
        image: edge.node.image,
        products: edge.node.products.edges.map(productEdge => ({
          id: productEdge.node.id,
          title: productEdge.node.title,
          handle: productEdge.node.handle,
          featuredImage: productEdge.node.featuredImage,
          price: productEdge.node.variants.edges[0]?.node.priceV2.amount,
          currencyCode: productEdge.node.variants.edges[0]?.node.priceV2.currencyCode
        }))
      }));

      setProducts(productsData);
      setCollections(collectionsData);

      // Build dynamic navigation from collections
      buildDynamicNavigation(collectionsData);
    } catch (error) {
      console.error('Error fetching Shopify data:', error);
    }
  };

  const buildDynamicNavigation = (collections) => {
    // Filter out any system collections (like "All" or "Home page")
    const userCollections = collections.filter(col =>
      !col.handle.includes('all') &&
      !col.handle.includes('frontpage') &&
      !col.handle.includes('home')
    );

    // Build navigation links directly from collections with their products
    const navigationLinks = userCollections.map(collection => ({
      href: `/collection/${collection.handle}`,
      label: collection.title,
      description: collection.description,
      megaMenu: {
        products: collection.products, // Top 5 products in this collection
        featured: [
          { label: `SHOP ALL ${collection.title.toUpperCase()}`, href: `/collection/${collection.handle}` }
        ],
        image: collection.image?.url || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop"
      }
    }));

    setLeftLinks(navigationLinks);
  };

  const rightLinks = [
    { href: "/wishlist", label: "Wishlist" },
    { href: "/cart", label: "Cart" }
  ];

  const closeMenu = () => {
    setHovered(null);
    setMegaMenuOpen(null);
  };

  const renderLink = (link, position) => {
    const id = `${position}-${link.label}`;
    const showBadge = link.label === 'Cart' || link.label === 'Wishlist';
    const count = link.label === 'Cart' ? cartCount : link.label === 'Wishlist' ? wishlistCount : 0;

    return (
      <span
        key={id}
        onMouseEnter={() => {
          setHovered(id);
          if (link.megaMenu) {
            setMegaMenuOpen(id);
          }
        }}
        onMouseLeave={() => {
          setHovered(null);
          setMegaMenuOpen(null);
        }}
        className={`
          transition-colors duration-300 uppercase cursor-pointer relative inline-block
          ${hovered === id ? "text-black" : hovered ? "text-gray-300" : "text-black"}
        `}
      >
        <Link href={link.href} onClick={closeMenu} className="relative inline-block cursor-pointer">
          {link.label}
          {showBadge && count > 0 && (
            <span className="absolute -top-2 -right-2  text-[10px] font-medium rounded-full flex items-center justify-center z-10">
              {count}
            </span>
          )}
        </Link>
      </span>
    );
  };

  return (
    <header className="w-full fixed top-0 left-0 z-9999">
      <AnnouncementBar />
      <nav className="grid grid-cols-3 items-center px-6 py-4 relative z-50 bg-white">
        {/* LEFT MENU */}
        <div className="flex items-center font-light tracking-wide gap-6 text-xs">
          {leftLinks.map(link => renderLink(link, "left"))}
        </div>

        {/* CENTER LOGO */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="text-xl font-medium uppercase"
            onClick={closeMenu}
          >
            ELORI JEWELS
          </Link>
        </div>

        {/* RIGHT MENU */}
        <div className="flex items-center justify-end font-light tracking-wide gap-6 text-xs">
          <button
            onClick={() => setIsSearchOpen(true)}
            onMouseEnter={() => setHovered("right-search")}
            onMouseLeave={() => setHovered(null)}
            className={`
              transition-colors duration-300 uppercase cursor-pointer
              ${hovered === "right-search" ? "text-black" : hovered ? "text-gray-300" : "text-black"}
            `}
          >
            Search
          </button>

          {rightLinks.map(link => renderLink(link, "right"))}
        </div>
      </nav>

      {/* MEGA MENU OVERLAY */}
      <div
        className={`
          fixed inset-0 top-[4.5rem] bg-black/40 transition-opacity duration-500 z-30
          ${megaMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={closeMenu}
      />

      {/* MEGA MENU */}
      {leftLinks.map(link => {
        if (!link.megaMenu) return null;
        const id = `left-${link.label}`;
        const isOpen = megaMenuOpen === id;

        return (
          <div
            key={id}
            onMouseEnter={() => {
              setHovered(id);
              setMegaMenuOpen(id);
            }}
            onMouseLeave={() => {
              setHovered(null);
              setMegaMenuOpen(null);
            }}
            className={`
              fixed left-0 top-[4.5rem] w-1/2 bg-white transition-transform duration-500 z-40
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{
              height: 'calc(100vh - 4.5rem)'
            }}
          >
            <div className="h-full flex">
              {/* LEFT SIDE - CONTENT */}
              <div className="w-1/2 px-8 pt-20 flex flex-col overflow-y-auto">
                {/* Collection Title */}
                <h2 className="text-3xl font-light text-gray-900 uppercase tracking-wide mb-6">
                  {link.label}
                </h2>

                {/* Top 5 Products */}
                {link.megaMenu.products && link.megaMenu.products.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Featured Products
                    </h3>
                    <div className="space-y-2">
                      {link.megaMenu.products.map((product, idx) => (
                        <Link
                          key={idx}
                          href={`/product/${product.handle}`}
                          className="block text-sm text-gray-700 hover:text-black transition-colors"
                          onClick={closeMenu}
                        >
                          {product.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Link */}
                {link.megaMenu.featured && link.megaMenu.featured.length > 0 && (
                  <div className="space-y-2 border-t">
                    {link.megaMenu.featured.map((featuredLink, idx) => (
                      <div onClick={closeMenu} key={idx} className="w-fit cursor-pointer">
                        <LinkButton href={featuredLink.href} text={"View All"} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Description if available */}
                {link.description && (
                  <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                    {link.description}
                  </p>
                )}
              </div>

              {/* RIGHT SIDE - IMAGE */}
              <div className="w-[25vw] h-[30vw] relative overflow-hidden">
                <Image
                  src={link.megaMenu.image}
                  alt={link.label}
                  height={1000}
                  width={800}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        collections={collections}
      />
    </header>
  );
}
