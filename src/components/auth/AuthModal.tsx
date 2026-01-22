"use client";

import { useState, useEffect, useRef } from "react";
import { X, Mail } from "lucide-react";
import gsap from "gsap";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setIsRedirecting(false);
      
      gsap.set(overlayRef.current, { opacity: 0, visibility: "visible" });
      gsap.set(modalRef.current, { opacity: 0, y: 20, scale: 0.95 });
      
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(modalRef.current, { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.4, 
        ease: "power2.out",
        delay: 0.1 
      });
    } else {
      gsap.to(modalRef.current, { opacity: 0, y: 20, scale: 0.95, duration: 0.2, ease: "power2.in" });
      gsap.to(overlayRef.current, { 
        opacity: 0, 
        duration: 0.3, 
        ease: "power2.in",
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.visibility = "hidden";
          }
        }
      });
    }
  }, [isOpen]);

  const handleRedirectLogin = () => {
    try {
      setError("");
      setIsRedirecting(true);
      const returnUrl = window.location.pathname + window.location.search;
      window.location.href = `/api/auth/start?returnUrl=${encodeURIComponent(returnUrl)}`;
    } catch (e) {
      console.error("[AuthModal] start auth redirect error", e);
      setError("Failed to start login. Please try again.");
      setIsRedirecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-99999 overflow-y-auto"
      style={{ visibility: "hidden" }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Centering wrapper */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        {/* Modal */}
        <div 
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-medium tracking-wide uppercase">
              Sign In
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Main Content */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Welcome</h3>
              <p className="text-gray-600 text-sm">
                Sign in to access your account, wishlist, and order history.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                You&apos;ll be redirected to Shopify&apos;s secure sign-in.
              </p>
            </div>

            <button
              onClick={handleRedirectLogin}
              disabled={isRedirecting}
              className="w-full bg-black text-white py-3.5 px-6 rounded-lg font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {isRedirecting ? "Redirecting..." : "Continue to Shopify Login"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Redirect URI must be whitelisted in your Customer Account API settings.
            </p>

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center mb-3">With your account you can:</p>
              <ul className="text-xs text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                  Save items to your wishlist
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                  Track your orders
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                  Faster checkout
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
