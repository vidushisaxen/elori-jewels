"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useStore } from "../../store";

// Types
export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
  defaultAddress?: {
    id?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  };
  orders?: {
    totalCount: number;
    edges?: Array<{
      node: {
        id: string;
        orderNumber: string;
        processedAt: string;
        financialStatus: string;
        fulfillmentStatus: string;
        totalPrice: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

interface AuthState {
  customer: ShopifyCustomer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (returnUrl?: string) => void;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  redirectToShopifyAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ShopifyAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    customer: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Get store actions
  const fetchWishlistFromShopify = useStore((state) => state.fetchWishlistFromShopify);
  const clearWishlistLocal = useStore((state) => state.clearWishlistLocal);
  const associateCartWithCustomer = useStore((state) => state.associateCartWithCustomer);
  const fetchCart = useStore((state) => state.fetchCart);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data.customer) {
          setState({
            customer: data.customer,
            isLoading: false,
            isAuthenticated: true,
          });
          
          // User is logged in - sync their data
          await associateCartWithCustomer();
          await fetchWishlistFromShopify();
          await fetchCart();
          
          return;
        }
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
    setState({ customer: null, isLoading: false, isAuthenticated: false });
  }, [associateCartWithCustomer, fetchWishlistFromShopify, fetchCart]);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGIN - Headless (open our modal), NO redirects to Shopify-hosted login
  // ─────────────────────────────────────────────────────────────────────────────

  const login = useCallback((returnUrl?: string) => {
    const url = returnUrl || window.location.pathname;
    // Header listens for this to open AuthModal
    window.dispatchEvent(
      new CustomEvent("shopify-auth:open", { detail: { mode: "login", returnUrl: url } })
    );
  }, []);

  const redirectToShopifyAccount = useCallback(() => {
    // In headless mode, keep users inside our Next.js account page.
    window.location.href = "/account";
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const data = await response.json();
      
      // If we got a logout URL from Shopify, redirect to it
      // Shopify will handle logout and redirect back to post_logout_redirect_uri
      if (data.logoutUrl) {
        window.location.href = data.logoutUrl;
        return; // Don't clear state yet - let Shopify handle the redirect
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    // If no logout URL (fallback), clear everything locally
    // Clear local wishlist
    clearWishlistLocal();
    
    // Fetch new anonymous cart
    await fetchCart();
    
    setState({ customer: null, isLoading: false, isAuthenticated: false });
  }, [clearWishlistLocal, fetchCart]);

  // ─────────────────────────────────────────────────────────────────────────────
  // REFRESH CUSTOMER
  // ─────────────────────────────────────────────────────────────────────────────

  const refreshCustomer = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshCustomer,
        redirectToShopifyAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a ShopifyAuthProvider");
  }
  return context;
}
// Convenience hooks
export function useCustomer() {
  const { customer } = useAuth();
  return customer;
}

export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}

