"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./ShopifyAuthContext";
import { User, LogOut, Package, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

interface UserMenuProps {
  onOpenAuthModal: (mode: "login" | "register") => void;
}

export function UserMenu({ onOpenAuthModal }: UserMenuProps) {
  const { customer, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-5 h-5 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated - show sign in button
  if (!isAuthenticated) {
    return (
      <div className="flexitems-center gap-2">
        <button
          onClick={() => onOpenAuthModal("login")}
          className="group relative  cursor-pointer hover:bg-zinc-800 duration-300 transition-all ease-in-out px-4 py-2 text-sm  bg-black  rounded-full font-medium tracking-wide uppercase overflow-hidden transition-all duration-300"
        >
          <span className="relative z-10 text-white transition-colors duration-300">
            Sign In
          </span>

        </button>
      </div>
    );
  }

  // Authenticated - show user menu

  console.log(customer);
  const initials = customer
    ? `${customer.email[0].toUpperCase() || ""}`
    : ":)";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
        >
          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
            <p className="font-medium text-gray-900 truncate">
              {customer?.firstName && customer?.lastName
                ? `${customer.firstName} ${customer.lastName}`
                : customer?.email}
            </p>
            {customer?.firstName && (
              <p className="text-sm text-gray-500 truncate">{customer.email}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User size={18} />
              <span className="text-sm">My Account</span>
            </Link>

            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Package size={18} />
              <span className="text-sm">Cart</span>
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Heart size={18} />
              <span className="text-sm">Wishlist</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
