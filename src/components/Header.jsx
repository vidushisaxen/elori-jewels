"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SearchModal } from "./SeachModal";
import { useLenis } from "lenis/react";
import { useStore } from "../store";
import { SearchIcon, ShoppingCartIcon } from "lucide-react";
import PrimaryButton from "./Buttons/PrimaryButton";
import gsap from "gsap";
import { UserMenu } from "./auth/UserMenu";
import { AuthModal } from "./auth/AuthModal";

export default function Header() {
  const [hovered, setHovered] = useState(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [leftLinks, setLeftLinks] = useState([]);
  const [hidden, setHidden] = useState(false);
  
  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  // Refs for GSAP animations
  const megaMenuRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const navRef = useRef(null);
  const prevScrollY = useRef(0);

  // Get current pathname to detect navigation
  const pathname = usePathname();

  // Zustand store
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const hasHydrated = useStore((state) => state._hasHydrated);

  // Only show counts after hydration to prevent flicker
  const wishlistCount = hasHydrated ? wishlist.length : 0;
  const cartCount = hasHydrated ? cart?.totalQuantity || 0 : 0;

  const lenis = useLenis();

  // Close menu when pathname changes (page navigation)
  useEffect(() => {
    setMegaMenuOpen(false);
    setHovered(null);
    setActiveLink(null);
  }, [pathname]);

  // Hide/show header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (megaMenuOpen) return;
      const currentY = window.pageYOffset;
      const scrollDelta = currentY - prevScrollY.current;
      if (scrollDelta > 0 && currentY > 100) {
        setHidden(true);
      } else if (scrollDelta < -10) {
        setHidden(false);
      }
      prevScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [megaMenuOpen]);

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

  // Stop Lenis when auth modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      window.lenis?.stop();
    } else {
      window.lenis?.start();
    }
  }, [isAuthModalOpen]);

  // GSAP animation for mega menu
  useEffect(() => {
    if (megaMenuOpen && megaMenuRef.current) {
      gsap.killTweensOf(megaMenuRef.current);
      gsap.to(megaMenuRef.current, {
        opacity: 1,
        height: "auto",
        paddingTop: "2vw",
        paddingBottom: "2vw",
        duration: 0.4,
        ease: "power2.out",
        onStart: () => {
          if (megaMenuRef.current) {
            megaMenuRef.current.style.visibility = "visible";
          }
        }
      });

      if (overlayRef.current) {
        gsap.killTweensOf(overlayRef.current);
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    } else if (megaMenuRef.current) {
      gsap.killTweensOf(megaMenuRef.current);
      gsap.to(megaMenuRef.current, {
        opacity: 0,
        height: "0",
        paddingTop: "0",
        paddingBottom: "0",
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          if (megaMenuRef.current) {
            megaMenuRef.current.style.visibility = "hidden";
          }
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

  // Animate content change
  useEffect(() => {
    if (contentRef.current && activeLink && megaMenuOpen) {
      // Reset all animations first
      gsap.set(contentRef.current.querySelector('.fadeup-content'), { opacity: 0, y: 10 });
      gsap.set(contentRef.current.querySelectorAll('.product-link'), { opacity: 0, y: 10 });
      gsap.set(contentRef.current.querySelector('.collection-image'), { opacity: 0, scale: 0.95 });
      gsap.set(contentRef.current.querySelector('.view-all-btn'), { opacity: 0, y: 10 });
      
      // Create timeline for smooth sequential animation
      const tl = gsap.timeline();
      
      // First fade in the container
      tl.to(
        contentRef.current.querySelector('.fadeup-content'),
        { 
          opacity: 1,
          y: 0,
          duration: 0.2, 
          delay: 0.1,
          ease: "power2.out",
        }
      )
      // Then fade in individual links faster
      .to(
        contentRef.current.querySelectorAll('.product-link'),
        { 
          opacity: 1, 
          y: 0,
          duration: 0.2, 
          stagger: 0.03, 
          ease: "power2.out" 
        },
        "-=0.05"
      )
      // Fade in image
      .to(
        contentRef.current.querySelector('.collection-image'),
        { 
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.25, 
          ease: "power2.out" 
        },
        "-=0.05"
      )
      // Fade in the button last
      .to(
        contentRef.current.querySelector('.view-all-btn'),
        { 
          opacity: 1,
          y: 0,
          duration: 0.25, 
          ease: "power2.out" 
        },
        "-=0.1"
      );
    }
  }, [activeLink, megaMenuOpen]);

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
        products: collection.products,
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

  const closeMenu = () => {
    setHovered(null);
    setMegaMenuOpen(false);
    setActiveLink(null);
  };

  const handleLinkHover = (link, id) => {
    setHovered(id);
    if (link.megaMenu) {
      setActiveLink(link);
      setMegaMenuOpen(true);
    }
  };

  const handleNavLeave = () => {
    // Reset to active link when leaving entire nav area
    const activeEl = navRef.current?.querySelector('a[data-active="true"]');
    if (activeEl) {
      const id = activeEl.getAttribute('data-id');
      setHovered(id);
    } else {
      setHovered(null);
    }
    closeMenu();
  };

  const openAuthModal = (mode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const handler = (event) => {
      const mode = event?.detail?.mode || "login";
      openAuthModal(mode);
    };
    window.addEventListener("shopify-auth:open", handler);
    return () => window.removeEventListener("shopify-auth:open", handler);
  }, []);

  const renderLink = (link, position) => {
    const id = `${position}-${link.label}`;
    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

    return (
      <span
        key={id}
        data-id={id}
        data-active={isActive ? "true" : "false"}
        onMouseEnter={() => handleLinkHover(link, id)}
        className={`
            transition-colors duration-50 uppercase cursor-pointer relative inline-block group
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
          <div className="overflow-hidden relative z-10">
            <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300">
              {link.label}
            </p>
            <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300">
              {link.label}
            </span>
          </div>
        </Link>
      </span>
    );
  };

  return (
    <>
    <header className={`w-full fixed top-0 left-0 z-[999] transform transition-transform duration-300 ${
      hidden ? "-translate-y-full" : "translate-y-0"
    }`}>
      <nav className="flex justify-between items-center px-8 py-6 shadow-sm relative z-50 bg-white">
        {/* LEFT MENU */}
        <div className="">
          <Link
            href="/"
            className="text-xl font-medium uppercase"
            onClick={closeMenu}
          >
            ELORI JEWELS
          </Link>
        </div>
        
        {/* CENTER NAVIGATION */}
        <div 
          ref={navRef}
          onMouseLeave={handleNavLeave}
          className="flex items-center h-full font-light tracking-wide gap-6 text-[0.85vw] relative "
          onMouseEnter={() => {
            // Keep menu open when hovering nav area
            if (activeLink) {
              setMegaMenuOpen(true);
            }
          }}
        >
          <span className=" h-10 w-120 absolute top-5 -left-5 bg-transparent pointer-events-auto"/>
          {leftLinks.map((link) => renderLink(link, "left"))}
          
          {/* MEGA MENU DROPDOWN - Width constrained to nav links */}
          <div
            className="absolute top-[120%] left-1/2 -translate-x-1/2 z-[52]"
            style={{ width: `${leftLinks.length * 8}vw` }}
          >
            <div
  ref={megaMenuRef}
  className="w-full rounded-[1vw] bg-white border border-black/10 overflow-hidden mt-10"
  style={{ height: "0", paddingTop: "0", paddingBottom: "0", opacity: 0, visibility: "hidden" }}
>
  <div ref={contentRef} className="w-full px-6 flex gap-8">
    {activeLink && (
      <>
        {/* Left side: Products, Separator, and Button */}
        <div className="flex-1 flex flex-col justify-between py-3">
          {/* Products Links */}
          {activeLink.megaMenu.products &&
            activeLink.megaMenu.products.length > 0 && (
              <div className="fadeup-content">
                <h3 className="text-xs font-semibold text-black uppercase tracking-wider mb-4">
                  Featured Products
                </h3>
                <ul className="flex flex-col w-full gap-y-3">
                  {activeLink.megaMenu.products.map((product, idx) => (
                    <li key={idx} className="flex items-center gap-3 overflow-hidden product-link" style={{ opacity: 0 }}>
                      <Link
                        href={`/product/${product.handle}`}
                        className="cursor-pointer group relative w-fit overflow-hidden"
                        onClick={closeMenu}
                      >
                        <div className="overflow-hidden relative z-10 text-sm tracking-widest">
                          <p className="group-hover:-translate-y-full translate-y-0 transition-all duration-300">
                            {product.title}
                          </p>
                          <span className="w-full h-full translate-y-full group-hover:translate-y-0 absolute left-0 top-0 transition-all duration-300">
                            {product.title}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Separator */}
          <div className="w-full border-t border-gray-200 mt-5"></div>

          {/* View All Button */}
          {activeLink.megaMenu.featured &&
            activeLink.megaMenu.featured.length > 0 && (
              <div className="view-all-btn" style={{ opacity: 0 }}>
                {activeLink.megaMenu.featured.map((featuredLink, idx) => (
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
        </div>

        {/* Right side: Full Height Image */}
        {activeLink.megaMenu.image && (
          <div className="w-[280px] collection-image" style={{ opacity: 0 }}>
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <img
                src={activeLink.megaMenu.image}
                alt={activeLink.label}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            </div>
          </div>
        )}
      </>
    )}
  </div>
</div>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="w-fit flex items-center justify-end gap-5 py-[1vw] bg-black px-[2vw] rounded-full text-black">
          <div
            className="w-4 h-4 cursor-pointer flex items-center justify-center group relative"
            onClick={() => setIsSearchOpen(true)}
          >
            <SearchIcon color="white" className="group-hover:scale-110 transition-transform duration-200 ease-out" />
          </div>
          <div className="w-px h-5 bg-white"></div>
          <Link
            href="/cart"
            className="w-5 h-5 cursor-pointer flex items-center justify-center relative group"
          >
            <ShoppingCartIcon strokeWidth={1.4} color="white" className="group-hover:scale-110 transition-transform duration-200 ease-out" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-transparent text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
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
        className={`icon-cart group-hover:scale-110 transition-transform duration-200 ease-out`}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          fill="transparent"
          stroke="white"
        />
      </svg>
            
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-transparent text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <div className="w-px h-5 bg-white"></div>

          {/* <div className="w-px h-5 bg-white"></div> */}
          
          {/* Shopify Auth - User Menu */}
          <UserMenu onOpenAuthModal={openAuthModal} />
        </div>
      </nav>

      {/* FULL SCREEN OVERLAY */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 z-[10] opacity-0 h-screen w-screen"
        style={{ 
          pointerEvents: megaMenuOpen ? "auto" : "none",
          visibility: megaMenuOpen ? "visible" : "hidden"
        }}
        onClick={closeMenu}
      />

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        collections={collections}
      />

      {/* AUTH MODAL */}
    </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
