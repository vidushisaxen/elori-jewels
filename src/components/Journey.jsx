"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Draggable } from "gsap/Draggable";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PrimaryButton from "./Buttons/PrimaryButton";

gsap.registerPlugin(Observer, Draggable);

const NEXT = 1;
const PREV = -1;

const Journey = ({ collections }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const slidesRef = useRef([]);
  const slidesInnerRef = useRef([]);
  const isAnimatingRef = useRef(false);
  const currentRef = useRef(0);
  const autoplayTimerRef = useRef(null);
  const containerRef = useRef(null);

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
    (direction) => {
      if (isAnimatingRef.current || !collections || collections.length === 0)
        return false;

      // Clear autoplay timer when manually navigating
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }

      setIsAnimating(true);
      isAnimatingRef.current = true;

      const previous = currentRef.current;
      const newCurrent =
        direction === 1
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

      gsap
        .timeline({
          onStart: () => {
            gsap.set(upcomingSlide, { zIndex: 99 });
            setCurrent(newCurrent);
            currentRef.current = newCurrent;
          },
          onComplete: () => {
            gsap.set(upcomingSlide, { zIndex: 1 });
            setIsAnimating(false);
            isAnimatingRef.current = false;

            startAutoplay();
          },
        })
        .addLabel("start", 0)
        .fromTo(
          upcomingSlide,
          {
            autoAlpha: 1,
            scale: 0.1,
            xPercent: direction * 100,
          },
          {
            duration: 0.7,
            ease: "expo",
            scale: 0.4,
            xPercent: 0,
          },
          "start"
        )
        .fromTo(
          upcomingInner,
          {
            filter: "contrast(100%) saturate(100%)",
            transformOrigin: "100% 50%",
            scaleX: 4,
          },
          {
            duration: 0.7,
            ease: "expo",
            scaleX: 1,
          },
          "start"
        )
        .fromTo(
          currentInner,
          {
            filter: "contrast(100%) saturate(100%)",
          },
          {
            duration: 0.7,
            ease: "expo",
            filter: "contrast(120%) saturate(140%)",
          },
          "start"
        )
        .addLabel("middle", "start+=0.6")
        .to(
          upcomingSlide,
          {
            duration: 1,
            ease: "power4.inOut",
            scale: 1,
          },
          "middle"
        )
        .to(
          currentSlide,
          {
            duration: 1,
            ease: "power4.inOut",
            scale: 0.98,
            autoAlpha: 0,
          },
          "middle"
        );
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
    }, 3000); // Change slide every 3 seconds
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

  // Drag functionality
  useEffect(() => {
    if (isLoading || !containerRef.current) return;

    const draggable = Draggable.create(containerRef.current, {
      type: "x",
      trigger: containerRef.current,
      onDragEnd: function () {
        const dragDistance = this.x;
        const threshold = 50; // minimum drag distance to trigger navigation

        if (Math.abs(dragDistance) > threshold) {
          if (dragDistance < 0) {
            // Dragged left, go next
            navigate(NEXT);
          } else {
            // Dragged right, go previous
            navigate(PREV);
          }
        }

        // Reset position
        gsap.to(containerRef.current, {
          x: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      },
    });

    return () => {
      draggable[0].kill();
    };
  }, [isLoading, navigate]);

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
      className="relative w-full h-[95vh] overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      )}

      {/* Navigation Buttons */}
      <nav className="absolute bottom-8 left-8 z-20 flex gap-4">
        <button
          onClick={() => navigate(PREV)}
          disabled={isAnimating}
          className="w-12 h-12 bg-black/20 backdrop-blur-sm text-white rounded-full hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl cursor-pointer"
          aria-label="Previous slide"
        >
          ←
        </button>
        <button
          onClick={() => navigate(NEXT)}
          disabled={isAnimating}
          className="w-12 h-12 bg-black/20 backdrop-blur-sm text-white rounded-full hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl cursor-pointer"
          aria-label="Next slide"
        >
          →
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
              }}
            />
          </div>
        ))}
      </div>

      {/* Collection Info Overlay - Single button that updates based on current slide */}
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

      {/* Slide counter */}
      <div className="absolute bottom-8 right-8 z-20 text-black text-sm font-light">
        <span className="text-2xl font-bold">
          {String(current + 1).padStart(2, "0")}
        </span>
        <span className="mx-2 opacity-60">/</span>
        <span className="opacity-60">
          {String(slidesTotal).padStart(2, "0")}
        </span>
      </div>

      <div className="size-full z-10 bg-black/20 inset-0 absolute"></div>
    </div>
  );
};

export default Journey;