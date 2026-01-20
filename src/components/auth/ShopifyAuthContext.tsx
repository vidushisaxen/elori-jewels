"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Types
export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
  defaultAddress?: {
    id: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  };
  orders?: {
    totalCount: number;
  };
}

interface AuthState {
  customer: ShopifyCustomer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  recoverPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (resetToken: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateCustomer: (input: UpdateCustomerInput) => Promise<{ success: boolean; error?: string }>;
  redirectToShopifyAccount: () => void;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptsMarketing?: boolean;
}

interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  acceptsMarketing?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Shopify store ID extracted from the URL you provided
const SHOPIFY_STORE_ID = "97678459179";

export function ShopifyAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    customer: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
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
          return;
        }
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
    setState({ customer: null, isLoading: false, isAuthenticated: false });
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.customer) {
        setState({
          customer: data.customer,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      }

      return { success: false, error: data.error || "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (response.ok && data.customer) {
        setState({
          customer: data.customer,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      }

      return { success: false, error: data.error || "Registration failed" };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setState({ customer: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshCustomer = useCallback(async () => {
    await checkSession();
  }, []);

  const recoverPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      }

      return { success: false, error: data.error || "Password recovery failed" };
    } catch (error) {
      console.error("Password recovery error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const resetPassword = useCallback(async (resetToken: string, password: string) => {
    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      }

      return { success: false, error: data.error || "Password reset failed" };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const updateCustomer = useCallback(async (input: UpdateCustomerInput) => {
    try {
      const response = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (response.ok && data.customer) {
        setState((prev) => ({
          ...prev,
          customer: data.customer,
        }));
        return { success: true };
      }

      return { success: false, error: data.error || "Update failed" };
    } catch (error) {
      console.error("Update error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  // Redirect to Shopify's hosted account page
  const redirectToShopifyAccount = useCallback(() => {
    // Using the Shopify customer account URL format
    window.location.href = `https://shopify.com/${SHOPIFY_STORE_ID}/account`;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshCustomer,
        recoverPassword,
        resetPassword,
        updateCustomer,
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
