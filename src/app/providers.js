"use client";

import { ShopifyAuthProvider } from "../components/auth/ShopifyAuthContext";

export default function Providers({ children }) {
  return <ShopifyAuthProvider>{children}</ShopifyAuthProvider>;
}
