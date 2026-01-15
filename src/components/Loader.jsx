"use client";

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLenis } from 'lenis/react'

export default function Loader() {
  const loaderRef = useRef(null);
  const textRef = useRef(null);
  const spinnerRef = useRef(null);
  const lenis = useLenis();
  
  const captions = [
    "Crafted with Elegance",
    "Timeless Beauty",
    "Sparkle & Shine",
    "Handcrafted Perfection",
    "Luxury Redefined",
    "Eternal Glamour",
    "Precious Moments",
    "Artisan Excellence"
  ];
  
  const [currentCaption, setCurrentCaption] = useState(captions[0]);

  useEffect(() => {
    // Stop Lenis scroll during loader
    if (lenis) {
      lenis.stop();
    }

    // Change caption every 400ms
    const captionInterval = setInterval(() => {
      setCurrentCaption(captions[Math.floor(Math.random() * captions.length)]);
    }, 800);

    // Animate spinner rotation
    gsap.to(spinnerRef.current, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: "linear"
    });

    // After 2 seconds, fade out spinner and text, then translate loader up
    const tl = gsap.timeline({ delay: 2 });

    tl.to([spinnerRef.current, textRef.current], {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut"
    });
    
    tl.to([loaderRef.current, '#backside-loader'], {
      y: "-100%",
      duration: 1,
      stagger: .2,
      ease: "power2.inOut",
      onComplete: () => {
        // Start Lenis scroll after loader finishes
        if (lenis) {
          lenis.start();
        }
      }
    });

    return () => {
      clearInterval(captionInterval);
      tl.kill();
    };
  }, [lenis]);

  return (
    <>
   <div 
     ref={loaderRef}
     className='h-screen w-screen flex fixed top-0 bg-white text-black left-0 flex-col z-9999 items-center justify-center gap-4'
   > 
     <div 
       ref={spinnerRef}
       className='w-6 h-6 border-2 border-gray-200 border-t-black rounded-full'
     />
     
     <div ref={textRef} className='relative'>
       <p className='uppercase text-xs text-black tracking-widest font-light text-center'>
         {currentCaption}
       </p>
     </div>
   </div>
   <div id='backside-loader' className='h-screen w-screen fixed top-0 bg-black z-9998 left-0 flex flex-col items-center pb-[1vw] justify-end gap-4 p-8'>
    <p className='text-white/30 text-[12vw] font-thin uppercase font-calibre'>ELORI JEWELS</p>
   </div>
  </>
)}
