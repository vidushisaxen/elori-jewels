"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./ShopifyAuthContext";
import { X } from "lucide-react";

export function ProfileCompletionModal() {
  const { customer, isAuthenticated, isLoading, refreshCustomer } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user needs to complete profile
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !customer) return;
    
    // Show modal if name is missing
    if (!customer.firstName || !customer.lastName) {
      setIsOpen(true);
      setFirstName(customer.firstName || "");
      setLastName(customer.lastName || "");
    }
  }, [customer, isAuthenticated, isLoading]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please fill in both fields");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/account/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.userErrors?.[0]?.message || "Failed to update");
        setIsSaving(false);
        return;
      }

      await refreshCustomer();
      setIsOpen(false);
    } catch (e) {
      console.error("Error updating name:", e);
      setError("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  if (!isOpen || isLoading || !isAuthenticated || !customer) {
    return null;
  }

  if (customer.firstName && customer.lastName) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleSkip} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded"
        >
          <X size={18} className="text-gray-500" />
        </button>

        <h2 className="text-lg font-medium mb-1">Complete Your Profile</h2>
        <p className="text-sm text-gray-500 mb-4">Add your name for a better experience</p>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        <div className="space-y-3 mb-4">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none"
            disabled={isSaving}
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none"
            disabled={isSaving}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSaving) handleSave();
            }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            className="flex-1 py-2 px-4 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2 px-4 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
