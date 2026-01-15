"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import PrimaryButton from "./Buttons/PrimaryButton";

gsap.registerPlugin(Observer);

const NEXT = 1;
const PREV = -1;

const Journey = ({ collections }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(NEXT);
  const slidesRef = useRef([]);
  const slidesInnerRef = useRef([]);
  const isAnimatingRef = useRef(false);
  const currentRef = useRef(0);
  const autoplayTimerRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const slidesTotal = collections?.length || 0;

  // Sync refs with state
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    if (!collections || collections.length === 0) return;

    // Preload images
    const imagePromises = collections.map((collection) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = collection.image?.url || collection.image?.src || "";
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(imagePromises).then(() => {
      setIsLoading(false);
    });
  }, [collections]);

  const navigate = useCallback(
    (dir) => {
      if (isAnimatingRef.current || !collections || collections.length === 0)
        return false;

      // Clear autoplay timer when manually navigating
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }

      setDirection(dir);
      setIsAnimating(true);
      isAnimatingRef.current = true;

      const previous = currentRef.current;
      const newCurrent =
        dir === 1
          ? previous < slidesTotal - 1
            ? previous + 1
            : 0
          : previous > 0
          ? previous - 1
          : slidesTotal - 1;

      const currentSlide = slidesRef.current[previous];
      const currentInner = slidesInnerRef.current[previous];
      const upcomingSlide = slidesRef.current[newCurrent];
      const upcomingInner = slidesInnerRef.current[newCurrent];

      if (!currentSlide || !upcomingSlide || !currentInner || !upcomingInner) {
        setIsAnimating(false);
        isAnimatingRef.current = false;
        return;
      }

      // Update the DOM
      gsap.set(upcomingSlide, { zIndex: 99, autoAlpha: 1 });
      setCurrent(newCurrent);
      currentRef.current = newCurrent;

      // Enhanced animation with clip-path
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(upcomingSlide, { zIndex: 1 });
          gsap.set(currentSlide, { autoAlpha: 0 });
          setIsAnimating(false);
          isAnimatingRef.current = false;
          startAutoplay();
        },
      });

      // Clip-path animation
      const clipPathStart = dir === NEXT 
        ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
        : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
      const clipPathEnd = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

      tl.fromTo(
        upcomingSlide,
        {
          clipPath: clipPathStart,
          autoAlpha: 1,
        },
        {
          duration: 1.4,
          clipPath: clipPathEnd,
          ease: "power3.inOut",
        },
        0
      )
        .fromTo(
          upcomingInner,
          {
            scale: 1.3,
            filter: "brightness(0.5)",
          },
          {
            duration: 1.4,
            scale: 1,
            filter: "brightness(1)",
            ease: "power3.out",
          },
          0
        )
     
    },
    [collections, slidesTotal]
  );

  // Autoplay functionality
  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
    }

    autoplayTimerRef.current = setTimeout(() => {
      navigate(NEXT);
    }, 5000); // Change slide every 5 seconds
  }, [navigate]);

  // Initialize autoplay
  useEffect(() => {
    if (isLoading) return;

    startAutoplay();

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [isLoading, startAutoplay]);

  // Touch/Swipe handlers
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distance = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        navigate(NEXT);
      } else {
        navigate(PREV);
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        navigate(PREV);
      } else if (e.key === "ArrowRight") {
        navigate(NEXT);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  if (!collections || collections.length === 0) {
    return (
      <div className="w-full h-[95vh] bg-black flex items-center justify-center">
        <p className="text-white text-xl">No collections available</p>
      </div>
    );
  }

  const currentCollection = collections[current];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[95vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      )}

      {/* Navigation Buttons - Enhanced styling */}
      <nav className="absolute bottom-8 left-8 z-20 flex gap-3">
        <button
          onClick={() => navigate(PREV)}
          disabled={isAnimating}
          className="group w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer border border-white/20 overflow-hidden"
          aria-label="Previous slide"
        >
          <div className="translate-x-[150%] group-hover:translate-x-0 transition-transform duration-300">
            <ChevronLeft color="black" className="w-6 h-6" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:-translate-x-[250%] transition-transform duration-300">
            <ChevronLeft color="white" className="w-6 h-6" />
          </div>
        </button>
        <button
          onClick={() => navigate(NEXT)}
          disabled={isAnimating}
          className="group w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer border border-white/20 overflow-hidden"
          aria-label="Next slide"
        >
          <div className="-translate-x-[150%] group-hover:translate-x-0 transition-transform duration-300">
            <ChevronRight color="black" className="w-6 h-6" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:translate-x-[250%] transition-transform duration-300">
            <ChevronRight color="white" className="w-6 h-6" />
          </div>
        </button>
      </nav>

      {/* Slides Container */}
      <div className="absolute inset-0">
        {collections.map((collection, index) => (
          <div
            key={collection.id}
            ref={(el) => (slidesRef.current[index] = el)}
            className={`absolute inset-0 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
            style={{
              zIndex: index === current ? 1 : 0,
            }}
          >
            <div
              ref={(el) => (slidesInnerRef.current[index] = el)}
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  collection.image?.url || collection.image?.src || ""
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        ))}
      </div>

      {/* Collection Info Overlay */}
      <div className="absolute inset-x-0 bottom-24 z-20 text-center px-6">
        <div className="max-w-2xl flex items-center justify-center mx-auto">
          <div className="w-fit">
            <PrimaryButton 
              text="Explore Collections" 
              href={`/collection/${currentCollection?.handle}` || "#"} 
              border={false}
            />
          </div>
        </div>
      </div>

      {/* Slide counter with progress bar */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col items-end gap-3">
        <div className="mix-blend-difference text-white text-sm font-light">
          <span className="text-2xl font-bold">
            {String(current + 1).padStart(2, "0")}
          </span>
          <span className="mx-2 opacity-60">/</span>
          <span className="opacity-60">
            {String(slidesTotal).padStart(2, "0")}
          </span>
        </div>
        {/* Progress indicators */}
        <div className="flex gap-2">
          {collections.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index !== current) {
                  navigate(index > current ? NEXT : PREV);
                }
              }}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                index === current
                  ? "w-8 bg-white"
                  : "w-4 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="size-full z-10 bg-black/30 inset-0 absolute pointer-events-none"></div>
    </div>
  );
};

export default Journey;