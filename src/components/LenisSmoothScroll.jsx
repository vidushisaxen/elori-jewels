"use client"
import gsap from "gsap";
import { useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';

const LenisSmoothScroll = ({ children }) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)

    return () => gsap.ticker.remove(update)
  }, []);

  return (
    <ReactLenis 
      root 
      options={{ 
        autoRaf: false,
        smoothTouch: true,
        touchMultiplier: 2,
      }} 
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  )
}

export default LenisSmoothScroll;