"use client";

import { useState, useEffect, useRef } from "react";
import { X, Mail } from "lucide-react";
import gsap from "gsap";
import { useAuth } from "./ShopifyAuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { refreshCustomer } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setEmail("");
      setCode("");
      setStep("email");
      setIsSending(false);
      setIsVerifying(false);
      
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

  const handleSendOtp = async () => {
    try {
      setError("");
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }

      setIsSending(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        setError(data?.error || "Failed to send code. Please try again.");
        return;
      }

      setStep("code");
    } catch (e) {
      console.error("[AuthModal] send-otp error", e);
      setError("Failed to send code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError("");
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedCode = code.trim();
      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        setError("Please enter a valid email address.");
        setStep("email");
        return;
      }
      if (!normalizedCode) {
        setError("Please enter the code we sent to your email.");
        return;
      }

      setIsVerifying(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, code: normalizedCode }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        setError(data?.error || "Invalid code. Please try again.");
        return;
      }

      await refreshCustomer();
      onClose();
    } catch (e) {
      console.error("[AuthModal] verify-otp error", e);
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
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
                No password needed - we&apos;ll send you a secure login code via email.
              </p>
            </div>

            {step === "email" ? (
              <>
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 text-left">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={isSending}
                  className="w-full bg-black text-white py-3.5 px-6 rounded-lg font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {isSending ? "Sending..." : "Send Login Code"}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 text-left">
                    Verification code
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter code"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-left">
                    We sent a code to <span className="font-medium text-gray-700">{email.trim()}</span>.
                  </p>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full bg-black text-white py-3.5 px-6 rounded-lg font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {isVerifying ? "Verifying..." : "Verify & Sign In"}
                </button>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("email");
                      setCode("");
                    }}
                    className="text-xs text-gray-500 hover:text-black transition-colors"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSending}
                    className="text-xs text-gray-500 hover:text-black transition-colors disabled:opacity-60"
                  >
                    {isSending ? "Resending..." : "Resend code"}
                  </button>
                </div>
              </>
            )}

            <p className="text-center text-xs text-gray-400 mt-4">
              We never redirect you to Shopify-hosted login pages. This is a headless email code sign-in.
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
