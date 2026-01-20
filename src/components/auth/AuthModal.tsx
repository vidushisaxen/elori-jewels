"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "./ShopifyAuthContext";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import gsap from "gsap";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register" | "recover";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "recover">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, recoverPassword } = useAuth();
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isOpen) {
      // Reset form state when opening
      setError("");
      setSuccess("");
      
      // Animate in
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
      // Animate out
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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const result = await login(email, password);
        if (result.success) {
          resetForm();
          onClose();
        } else {
          setError(result.error || "Login failed");
        }
      } else if (mode === "register") {
        const result = await register({ email, password, firstName, lastName });
        if (result.success) {
          resetForm();
          onClose();
        } else {
          setError(result.error || "Registration failed");
        }
      } else if (mode === "recover") {
        const result = await recoverPassword(email);
        if (result.success) {
          setSuccess("If an account exists with this email, you will receive a password reset link.");
          setEmail("");
        } else {
          setError(result.error || "Password recovery failed");
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: "login" | "register" | "recover") => {
    setMode(newMode);
    setError("");
    setSuccess("");
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[99999] overflow-y-auto"
      style={{ visibility: "hidden" }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Centering wrapper */}
      <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 pointer-events-none">
        {/* Modal */}
        <div 
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
        >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-medium tracking-wide uppercase">
            {mode === "login" && "Sign In"}
            {mode === "register" && "Create Account"}
            {mode === "recover" && "Reset Password"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Name Fields (Register only) */}
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              placeholder="you@example.com"
            />
          </div>

          {/* Password (Login & Register) */}
          {mode !== "recover" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={5}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Link (Login only) */}
          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode("recover")}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {mode === "login" && "Sign In"}
            {mode === "register" && "Create Account"}
            {mode === "recover" && "Send Reset Link"}
          </button>

          {/* Switch Mode Links */}
          <div className="text-center text-sm text-gray-500 pt-2">
            {mode === "login" && (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-black font-medium hover:underline"
                >
                  Create one
                </button>
              </>
            )}
            {mode === "register" && (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-black font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
            {mode === "recover" && (
              <>
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-black font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
