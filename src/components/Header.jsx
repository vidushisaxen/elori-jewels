"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AnnouncementBar from "./AnnouncementsBar";
import { SearchModal } from "./SeachModal";
import { useLenis } from "lenis/react";
import { useStore } from "../store";
import Image from "next/image";
import LinkButton from "./Buttons/LinkButton";
import {
  HeartCrack,
  HeartIcon,
  ListCheckIcon,
  SearchIcon,
  ShoppingBag,
  ShoppingBagIcon,
  ShoppingCartIcon,
  User2,
} from "lucide-react";
import WishlistButton from "./WishlistButton";
import PrimaryButton from "./Buttons/PrimaryButton";
import gsap from "gsap";

export default function Header() {
  const [hovered, setHovered] = useState(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [leftLinks, setLeftLinks] = useState([]);

  // Refs for GSAP animations
  const megaMenuRefs = useRef({});
  const overlayRef = useRef(null);

  // Zustand store
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const hasHydrated = useStore((state) => state._hasHydrated);

  // Only show counts after hydration to prevent flicker
  const wishlistCount = hasHydrated ? wishlist.length : 0;
  const cartCount = hasHydrated ? cart?.totalQuantity || 0 : 0;

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

  // GSAP animation for mega menu
  useEffect(() => {
    if (megaMenuOpen) {
      const menuElement = megaMenuRefs.current[megaMenuOpen];

      if (menuElement) {
        gsap.killTweensOf(menuElement);
        gsap.to(menuElement, {
          x: 0,
          duration: 0.6,
          ease: "power3.out",
        });
      }

      if (overlayRef.current) {
        gsap.killTweensOf(overlayRef.current);
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    } else {
      // Close all menus
      Object.values(megaMenuRefs.current).forEach((menuElement) => {
        if (menuElement) {
          gsap.killTweensOf(menuElement);
          gsap.to(menuElement, {
            x: "-100%",
            duration: 0.5,
            ease: "power3.in",
          });
        }
      });

      if (overlayRef.current) {
        gsap.killTweensOf(overlayRef.current);
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }
  }, [megaMenuOpen]);

  const fetchShopifyData = async () => {
    try {
      const response = await fetch("/api/shopify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
            `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.data) {
        console.error("Invalid response structure:", data);
        return;
      }

      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        return;
      }

      // Transform products
      const productsData = data.data.products.edges.map((edge) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        tags: edge.node.tags,
        productType: edge.node.productType,
        vendor: edge.node.vendor,
        featuredImage: edge.node.featuredImage,
        variants: edge.node.variants.edges.map((v) => ({
          price: v.node.priceV2.amount,
          currencyCode: v.node.priceV2.currencyCode,
        })),
      }));

      // Transform collections with their top 5 products
      const collectionsData = data.data.collections.edges.map((edge) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        description: edge.node.description,
        image: edge.node.image,
        products: edge.node.products.edges.map((productEdge) => ({
          id: productEdge.node.id,
          title: productEdge.node.title,
          handle: productEdge.node.handle,
          featuredImage: productEdge.node.featuredImage,
          price: productEdge.node.variants.edges[0]?.node.priceV2.amount,
          currencyCode:
            productEdge.node.variants.edges[0]?.node.priceV2.currencyCode,
        })),
      }));

      setProducts(productsData);
      setCollections(collectionsData);

      // Build dynamic navigation from collections
      buildDynamicNavigation(collectionsData);
    } catch (error) {
      console.error("Error fetching Shopify data:", error);
    }
  };

  const buildDynamicNavigation = (collections) => {
    // Filter out any system collections (like "All" or "Home page")
    const userCollections = collections.filter(
      (col) =>
        !col.handle.includes("all") &&
        !col.handle.includes("frontpage") &&
        !col.handle.includes("home")
    );

    // Build navigation links directly from collections with their products
    const navigationLinks = userCollections.map((collection) => ({
      href: `/collection/${collection.handle}`,
      label: collection.title,
      description: collection.description,
      megaMenu: {
        products: collection.products, // Top 5 products in this collection
        featured: [
          {
            label: `SHOP ALL ${collection.title.toUpperCase()}`,
            href: `/collection/${collection.handle}`,
          },
        ],
        image:
          collection.image?.url ||
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop",
      },
    }));

    setLeftLinks(navigationLinks);
  };

  const rightLinks = [
    { href: "/wishlist", label: "Wishlist" },
    { href: "/cart", label: "Cart" },
  ];

  const closeMenu = () => {
    setHovered(null);
    setMegaMenuOpen(null);
  };

  const renderLink = (link, position) => {
    const id = `${position}-${link.label}`;
    const showBadge = link.label === "Cart" || link.label === "Wishlist";
    const count =
      link.label === "Cart"
        ? cartCount
        : link.label === "Wishlist"
        ? wishlistCount
        : 0;

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
            ${
              hovered === id
                ? "text-black"
                : hovered
                ? "text-gray-300"
                : "text-black"
            }
          `}
      >
        <Link
          href={link.href}
          onClick={closeMenu}
          className="relative inline-block cursor-pointer"
        >
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
    <header className="w-full fixed  top-0 left-0 z-9999">
      {/* <AnnouncementBar /> */}
      <nav className="grid grid-cols-3 items-center px-6 py-6 shadow-sm relative z-50  bg-white">
        {/* LEFT MENU */}
        <div className="flex items-center font-light tracking-wide gap-6 text-xs">
          {leftLinks.map((link) => renderLink(link, "left"))}
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

        <div className="w-fit px-[2vw] bg-black  absolute right-[1.2vw] rounded-full flex items-center justify-between gap-5 py-[1vw] text-white">
          <div
            className="w-4 h-4 cursor-pointer flex items-center justify-center group relative"
            onClick={() => setIsSearchOpen(true)}
          >
            <SearchIcon className="group-hover:scale-110 transition-transform duration-200 ease-out" />
          </div>
          <div className="w-px h-5 bg-white"></div>
          <Link
            href="/cart"
            className="w-5 h-5 cursor-pointer flex items-center justify-center relative group"
          >
            <ShoppingCartIcon strokeWidth={1.4} className="group-hover:scale-110 transition-transform duration-200 ease-out" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="w-px h-5 bg-white"></div>
          <Link
            href="/wishlist"
            className="w-5 h-5 cursor-pointer flex items-center justify-center relative group"
          >
            <svg
              className="icon-cart group-hover:scale-110 transition-transform duration-200 ease-out"
              width="15"
              height="18"
              viewBox="0 0 15 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              data-v-f756b3ad=""
            >
              <path
                d="M1.19891 5.8049C1.2448 5.02484 1.89076 4.41576 2.67216 4.41576H12.0298C12.8112 4.41576 13.4572 5.02485 13.5031 5.8049L14.0884 15.7547C14.1382 16.6023 13.4643 17.3171 12.6151 17.3171H2.08688C1.23775 17.3171 0.563767 16.6023 0.61363 15.7547L1.19891 5.8049Z"
                stroke="white"
                strokeWidth="0.983866"
              ></path>
              <path
                d="M11.4354 6.3737C11.4354 3.21604 9.60694 0.65625 7.35147 0.65625C5.096 0.65625 3.26758 3.21604 3.26758 6.3737"
                stroke="white"
                strokeWidth="0.983866"
                strokeLinecap="round"
              ></path>
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* MEGA MENU OVERLAY */}
      <div
        ref={overlayRef}
        className="fixed inset-0 top-[4.5rem] bg-black/40 z-30 opacity-0 pointer-events-none"
        style={{ pointerEvents: megaMenuOpen ? "auto" : "none" }}
        onClick={closeMenu}
      />

      {/* MEGA MENU */}
      {leftLinks.map((link) => {
        if (!link.megaMenu) return null;
        const id = `left-${link.label}`;

        return (
          <div
            key={id}
            ref={(el) => (megaMenuRefs.current[id] = el)}
            onMouseEnter={() => {
              setHovered(id);
              setMegaMenuOpen(id);
            }}
            onMouseLeave={() => {
              setHovered(null);
              setMegaMenuOpen(null);
            }}
            className="fixed left-0 top-[4.5rem] w-1/2 bg-white shadow-md z-40"
            style={{
              height: "calc(100vh - 4.5rem)",
              transform: "translateX(-100%)",
            }}
          >
            <div className="h-full flex">
              {/* LEFT SIDE - CONTENT */}
              <div className="w-full px-12 pt-16 pb-8 flex flex-col overflow-y-auto">
                {/* Collection Title */}
                <h2 className="text-4xl font-light text-gray-900 uppercase tracking-wider mb-0 pb-2">
                  {link.label}
                </h2>

                {/* Top 5 Products */}
                {link.megaMenu.products &&
                  link.megaMenu.products.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xs font-thin text-black uppercase tracking-wider mb-4">
                        Featured Products
                      </h3>
                      <div className="flex flex-wrap w-[80%] mt-[2vw] gap-x-4 gap-y-2">
                        {link.megaMenu.products
                          .map((product, idx) => (
                            <Link
                              key={idx}
                              href={`/product/${product.handle}`}
                              className="cursor-pointer h-fit group space-y-1 relative w-fit"
                              onClick={closeMenu}
                            >
                              <div className=" overflow-hidden relative z-10 text-sm tracking-widest">
                                <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300">
                                  {product.title}
                                </p>
                                <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300">
                                  {product.title}
                                </span>
                              </div>
                            </Link>
                          ))
                          .reduce((acc, curr, idx) => {
                            if (idx === 0) return [curr];
                            return [
                              ...acc,
                              <span
                                key={`sep-${idx}`}
                                className="text-gray-300 select-none"
                              >
                                |
                              </span>,
                              curr,
                            ];
                          }, [])}
                      </div>
                    </div>
                  )}

                {/* Featured Link */}
                {link.megaMenu.featured &&
                  link.megaMenu.featured.length > 0 && (
                    <div className="space-y-3  border-t border-gray-200">
                      {link.megaMenu.featured.map((featuredLink, idx) => (
                        <div
                          onClick={closeMenu}
                          key={idx}
                          className="w-fit cursor-pointer transform hover:scale-105 transition-transform duration-200"
                        >
                          <PrimaryButton
                            border={true}
                            href={featuredLink.href}
                            text={"View All"}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                {/* Description if available */}
                {link.description && (
                  <p className="mt-6 text-sm  text-gray-600 leading-relaxed w-[80%]">
                    {link.description}
                  </p>
                )}
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
