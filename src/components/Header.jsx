'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import AnnouncementBar from "./AnnouncementsBar";
import { SearchModal } from "./SeachModal";
export default function Header() {
  const [hovered, setHovered] = useState(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);

  // Fetch products and collections from Shopify
  useEffect(() => {
    fetchShopifyData();
  }, []);

  const fetchShopifyData = async () => {
    try {
      // Replace with your actual Shopify API endpoint and credentials
      const response = await fetch('/api/shopify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              products(first: 250) {
                edges {
                  node {
                    id
                    title
                    tags
                    productType
                    vendor
                    featuredImage {
                      url
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          price
                        }
                      }
                    }
                  }
                }
              }
              collections(first: 10) {
                edges {
                  node {
                    id
                    title
                    image {
                      url
                    }
                  }
                }
              }
            }
          `
        })
      });

      const data = await response.json();
      
      // Transform Shopify GraphQL response to flat array
      const productsData = data.data.products.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        tags: edge.node.tags,
        productType: edge.node.productType,
        vendor: edge.node.vendor,
        featuredImage: edge.node.featuredImage,
        variants: edge.node.variants.edges.map(v => v.node),
      }));
      
      const collectionsData = data.data.collections.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        image: edge.node.image,
      }));
      
      setProducts(productsData);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching Shopify data:', error);
    }
  };

  const leftLinks = [
    { 
      href: "/collections/all", 
      label: "Shop",
      megaMenu: {
        sections: [
          {
            title: "NEW ARRIVALS",
            links: []
          },
          {
            title: "PERSONALISED",
            links: []
          },
          {
            title: "ICONS",
            links: []
          },
          {
            title: "GIFTS",
            links: []
          },
          {
            title: "NECKLACES",
            links: []
          },
          {
            title: "EARRINGS",
            links: []
          },
          {
            title: "BRACELETS",
            links: []
          },
          {
            title: "RINGS",
            links: []
          },
          {
            title: "MEN'S",
            links: []
          },
          {
            title: "ENGAGEMENT & BRIDAL",
            links: []
          },
          {
            title: "COLLECTIONS",
            links: []
          }
        ],
        featured: [
          { label: "SHOP ALL", href: "/collections/all" },
          { label: "ONDINE", href: "/collections/ondine" },
          { label: "SILVER", href: "/collections/silver" },
          { label: "MARINE", href: "/collections/marine" }
        ],
        image: "https://picsum.photos/id/1011/600/800"
      }
    },
    { 
      href: "/pages/appointments", 
      label: "Book Appointment",
      megaMenu: {
        sections: [
          {
            title: "PIERCING",
            links: []
          },
          {
            title: "ENGAGEMENT & BRIDAL",
            links: []
          },
          {
            title: "SOLDERED",
            links: []
          },
          {
            title: "VIRTUAL",
            links: []
          }
        ],
        featured: [
          { label: "LEARN MORE", href: "#" },
          { label: "BOOK PIERCING APPOINTMENT", href: "/book/piercing" },
          { label: "BOOK EAR STYLING APPOINTMENT", href: "/book/styling" },
          { label: "BOOK AFTERCARE APPOINTMENT", href: "/book/aftercare" },
          { label: "BOOK EAR SPA APPOINTMENT", href: "/book/spa" },
          { label: "KIDS & TEENS PIERCING", href: "/book/kids" },
          { label: "SHOP PIERCING EARRINGS", href: "/collections/piercing" },
          { label: "STYLE GUIDE", href: "/style-guide" },
          { label: "AFTERCARE GUIDE", href: "/aftercare" },
          { label: "FAQS", href: "/faqs" }
        ],
        image: "https://picsum.photos/id/1002/600/800"
      }
    },
    { 
      href: "/pages/engagement-experience", 
      label: "Engagement & Bridal",
      megaMenu: {
        sections: [
          {
            title: "SHOP BY",
            links: []
          },
          {
            title: "DISCOVER",
            links: []
          }
        ],
        featured: [
          { label: "ENGAGEMENT RINGS", href: "/collections/engagement-rings" },
          { label: "WOMENS WEDDING BANDS", href: "/collections/womens-wedding-bands" },
          { label: "MENS WEDDING BANDS", href: "/collections/mens-wedding-bands" },
          { label: "ETERNITY BANDS", href: "/collections/eternity-bands" },
          { label: "BRIDAL JEWELLERY", href: "/collections/bridal-jewellery" },
          { label: "MILESTONE JEWELLERY", href: "/collections/milestone" },
          { label: "READY TO SET", href: "/collections/ready-to-set" }
        ],
        image: "https://picsum.photos/id/1025/600/800"
      }
    },
    { 
      href: "/pages/our-world", 
      label: "Our World",
      megaMenu: {
        sections: [
          {
            title: "STORES",
            links: []
          },
          {
            title: "BRAND",
            links: []
          },
          {
            title: "JOURNAL",
            links: []
          },
          {
            title: "PHILANTHROPY",
            links: []
          }
        ],
        featured: [
          { label: "ALL STORES", href: "/pages/stores" },
          { label: "VICTORIA", href: "/pages/stores/victoria" },
          { label: "NEW SOUTH WALES", href: "/pages/stores/nsw" },
          { label: "QUEENSLAND", href: "/pages/stores/queensland" },
          { label: "WESTERN AUSTRALIA", href: "/pages/stores/wa" },
          { label: "WHATS ON IN STORE", href: "/pages/events" }
        ],
        image: "https://picsum.photos/id/1039/600/800"
      }
    }
  ];

  const rightLinks = [
    { href: "/wishlist", label: "Wishlist" },
    { href: "/cart", label: "Cart" },
    { href: "/account", label: "Account" },
  ];

  const renderLink = (link, position) => {
    const id = `${position}-${link.label}`;

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
          transition-colors duration-300 uppercase cursor-pointer
          ${hovered === id ? "text-black" : hovered ? "text-gray-300" : "text-black"}
        `}
      >
        <Link href={link.href}>{link.label}</Link>
      </span>
    );
  };

  return (
    <header className="w-full fixed top-0 left-0 z-999">
      <AnnouncementBar/>
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
          >
            ELORI JEWELS
          </Link>
        </div>

        {/* RIGHT MENU */}
        <div className="flex items-center justify-end font-light tracking-wide gap-6 text-xs">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="transition-colors duration-300 uppercase cursor-pointer hover:text-black"
          >
            Search
          </button>
          
          {rightLinks.map(link => renderLink(link, "right"))}
        </div>
      </nav>

      {/* MEGA MENU OVERLAY */}
      <div
        className={`
          fixed inset-0 top-18 bg-black/40 transition-opacity duration-500 z-30
          ${megaMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={() => {
          setHovered(null);
          setMegaMenuOpen(null);
        }}
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
              fixed left-0 top-18 w-1/2 bg-white shadow-2xl transition-transform duration-500 z-40
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{ 
              height: 'calc(100vh - 72px)'
            }}
          >
            <div className="h-full flex">
              {/* LEFT SIDE - LINKS */}
              <div className="w-1/2 px-5 pt-20 flex! gap-6">
                {/* Main Sections */}
                <div className="space-y-2 mb-8">
                  {link.megaMenu.sections.map((section, idx) => (
                    <div key={idx}>
                      <Link href={"/"} className="text-2xl font-extralight text-gray-300 uppercase tracking-wide font-heading! hover:text-black transition-colors duration-300 ease-in">
                        {section.title}
                      </Link>
                      {section.links.length > 0 && (
                        <div className="space-y-2">
                          {section.links.map((subLink, subIdx) => (
                            <Link
                              key={subIdx}
                              href={subLink.href}
                              className="block text-sm hover:text-gray-600 transition-colors uppercase"
                            >
                              {subLink.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Featured Links */}
                <div className="space-y-2 w-full">
                  {link.megaMenu.featured.map((featuredLink, idx) => (
                    <Link
                      key={idx}
                      href={featuredLink.href}
                      className="block text-xs text-gray-300 hover:text-black transition-colors uppercase"
                    >
                      {featuredLink.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE - IMAGE */}
              <div className="w-[20vw] h-[28vw] relative top-20 -right-10 overflow-hidden">
                <img
                  src={link.megaMenu.image}
                  alt={link.label}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ width: '100%', height: '100%' }}
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