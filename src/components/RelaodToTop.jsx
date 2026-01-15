"use client";

import React, { useEffect } from "react";
import { useLenis } from "lenis/react";

// Wrapper component for scroll to top on reload
function ScrollToTopOnReload({ children }) {
  const lenis = useLenis();
  
  useEffect(() => {
    if (!lenis) return;
    // Scroll to top on page load/reload
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      lenis.scrollTo(0, {
        immediate: true,
        force: true,
      });
    }
  }, [lenis]);

  return <>{children}</>;
}

export default ScrollToTopOnReload;