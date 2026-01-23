"use client";

import { ShopifyAuthProvider } from "../components/auth/ShopifyAuthContext";
import { ProfileCompletionModal } from "../components/auth/ProfileCompletionModal";

export default function Providers({ children }) {
  return (
    <ShopifyAuthProvider>
      {children}
      <ProfileCompletionModal />
    </ShopifyAuthProvider>
  );
}
