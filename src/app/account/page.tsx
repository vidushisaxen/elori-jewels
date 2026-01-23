"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/ShopifyAuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
  DollarSign,
  BaggageClaim
} from "lucide-react";
import Header from "../../components/Header";

export default function AccountPage() {
  const { customer, isAuthenticated, isLoading, logout, refreshCustomer } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [hasInitNameFields, setHasInitNameFields] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!customer) return;
    if (hasInitNameFields) return;
    setFirstName(customer.firstName || "");
    setLastName(customer.lastName || "");
    setHasInitNameFields(true);
  }, [customer, hasInitNameFields]);

  // If customer has no name yet, auto-open the name editor so they can fill details
  useEffect(() => {
    if (!customer) return;
    if (!customer.firstName || !customer.lastName) {
      setIsEditingName(true);
      setNameSaved(false);
      setNameError(null);
    }
  }, [customer]);

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

  // Calculate total spend from orders if available
  const totalSpend = customer.orders?.edges?.reduce((sum: number, edge: any) => {
    const amount = parseFloat(edge.node?.totalPrice?.amount || 0);
    return sum + amount;
  }, 0) || 0;

  const currencyCode = customer.orders?.edges?.[0]?.node?.totalPrice?.currencyCode || "USD";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-medium tracking-wide mb-2">My Account</h1>
            <p className="text-gray-500">
              Welcome back, {customer.firstName || customer.email}
            </p>
          </div>

          {/* Profile Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
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
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Profile Details</h3>
              
              {/* Update Name */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Name</p>
                  <button
                    onClick={() => {
                      setNameError(null);
                      setNameSaved(false);
                      setIsEditingName((v) => !v);
                      if (!isEditingName) {
                        setFirstName(customer.firstName || "");
                        setLastName(customer.lastName || "");
                      }
                    }}
                    className="text-sm underline text-gray-600 hover:text-black"
                    type="button"
                  >
                    {isEditingName ? "Cancel" : "Edit"}
                  </button>
                </div>

                {nameError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {nameError}
                  </div>
                )}
                {nameSaved && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    Name updated
                  </div>
                )}

                {isEditingName ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">First Name</label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Last Name</label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        placeholder="Last name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        disabled={isSavingName}
                        onClick={async () => {
                          try {
                            setIsSavingName(true);
                            setNameError(null);
                            setNameSaved(false);
                            const res = await fetch("/api/account/update-name", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ firstName, lastName }),
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok || !data.ok) {
                              if (data?.error === "admin_api_not_configured") {
                                setNameError(
                                  "Name updates require the Shopify Admin API. Please configure SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_ACCESS_TOKEN."
                                );
                              } else {
                                setNameError(data?.error || "Failed to update name");
                              }
                              return;
                            }
                            await refreshCustomer();
                            setNameSaved(true);
                            setIsEditingName(false);
                          } catch (e) {
                            setNameError("Failed to update name");
                          } finally {
                            setIsSavingName(false);
                          }
                        }}
                        className="w-full bg-black text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
                      >
                        {isSavingName ? "Saving..." : "Save name"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">First Name</p>
                  <p className="font-medium">{customer.firstName || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Name</p>
                  <p className="font-medium">{customer.lastName || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{customer.phone || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <Package size={24} className="mx-auto mb-2 text-gray-600" />
              <p className="text-2xl font-semibold">{customer.orders?.totalCount || 0}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <BaggageClaim size={24} className="mx-auto mb-2 text-gray-600" />
              <p className="text-2xl font-semibold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currencyCode,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalSpend)}
              </p>
              <p className="text-sm text-gray-500">Total Spend</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <Link href="/wishlist">
              <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Heart size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Wishlist</h3>
                    <p className="text-sm text-gray-500">View your saved items</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </Link>
            <div className="border-b border-gray-100 mx-5" />
            <Link href="/account/settings">
              <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Settings size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Account Settings</h3>
                    <p className="text-sm text-gray-500">Update your preferences</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </Link>
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
        </div>
      </main>
    </>
  );
}
