"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/ShopifyAuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut,
  ChevronRight,
  ExternalLink,
  Loader2
} from "lucide-react";

export default function AccountPage() {
  const { customer, isAuthenticated, isLoading, logout, redirectToShopifyAccount } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Redirect to home if not authenticated after loading
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return null;
  }

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      description: "View and edit your personal information",
      onClick: redirectToShopifyAccount,
      external: true,
    },
    {
      icon: Package,
      label: "Orders",
      description: "Track and manage your orders",
      onClick: redirectToShopifyAccount,
      external: true,
    },
    {
      icon: Heart,
      label: "Wishlist",
      description: "View your saved items",
      href: "/wishlist",
    },
    {
      icon: MapPin,
      label: "Addresses",
      description: "Manage your shipping addresses",
      onClick: redirectToShopifyAccount,
      external: true,
    },
    {
      icon: Settings,
      label: "Account Settings",
      description: "Update password and preferences",
      onClick: redirectToShopifyAccount,
      external: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-medium tracking-wide mb-2">My Account</h1>
          <p className="text-gray-500">
            Welcome back, {customer.firstName || customer.email}
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-semibold">
              {customer.firstName && customer.lastName
                ? `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase()
                : customer.email[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-medium">
                {customer.firstName && customer.lastName
                  ? `${customer.firstName} ${customer.lastName}`
                  : "Welcome"}
              </h2>
              <p className="text-gray-500">{customer.email}</p>
              {customer.phone && (
                <p className="text-gray-400 text-sm">{customer.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.label}</h3>
                      {item.external && (
                        <ExternalLink size={14} className="text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            );

            if (item.href) {
              return (
                <Link key={index} href={item.href}>
                  {content}
                  {index < menuItems.length - 1 && (
                    <div className="border-b border-gray-100 mx-5" />
                  )}
                </Link>
              );
            }

            return (
              <div key={index}>
                <div onClick={item.onClick}>{content}</div>
                {index < menuItems.length - 1 && (
                  <div className="border-b border-gray-100 mx-5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <LogOut size={20} />
          )}
          <span className="font-medium">Sign Out</span>
        </button>

        {/* Shopify Account Link */}
        <div className="mt-8 text-center">
          <button
            onClick={redirectToShopifyAccount}
            className="text-sm text-gray-500 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            Manage full account on Shopify
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </main>
  );
}
