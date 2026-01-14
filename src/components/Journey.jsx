"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Draggable } from "gsap/Draggable";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    }, 3000); // Change slide every 5 seconds
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

  // SCROLL/WHEEL NAVIGATION - COMMENTED OUT
  // Uncomment the code below to enable scroll/wheel navigation
  /*
  useEffect(() => {
    if (isLoading) return;

    // Initialize GSAP Observer
    const observer = Observer.create({
      type: 'wheel,touch,pointer',
      onDown: () => navigate(PREV),
      onUp: () => navigate(NEXT),
      wheelSpeed: -1,
      tolerance: 10,
    });

    return () => observer.kill();
  }, [isLoading, navigate]);
  */

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
      className="relative w-full h-[95vh]  overflow-hidden  cursor-grab active:cursor-grabbing"
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
      <div className="absolute  inset-0">
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

      {/* Collection Info Overlay */}
      <div className="absolute inset-x-0 bottom-24 z-20 text-center px-6">
        <div className="max-w-2xl flex items-center justify-center mx-auto">
          <Link
            href="/collections/earrings"
            className=" flex items-center w-[20vw] justify-between gap-3 px-2 py-2 rounded-full bg-white text-black text-xs font-light uppercase tracking-wide transition-all duration-300 hover:bg-gray-100 group"
          >
            <div className="flex pl-[1vw] flex-col relative items-start justify-center w-fit overflow-hidden h-[1.2em]">
              <span className="font-medium transition-transform duration-300 group-hover:-translate-y-full">
                Explore Collection
              </span>
              <span className="font-medium absolute top-full left-[1vw] transition-transform duration-300 group-hover:-translate-y-full">
                Explore Collection
              </span>
            </div>

            <div className="size-[2vw] p-2 rounded-full  overflow-hidden bg-[#3b3b3b]">
              <span className="size-full  relative flex items-center justify-center">
                <div className="size-full -rotate-45  group-hover:translate-x-[150%] group-hover:translate-y-[-150%] transition-all duration-300 flex items-center justify-center">
                  <ArrowRight color="white" />
                </div>
                <div className="size-full -rotate-45 absolute top-0 duration-300 translate-x-[-150%] translate-y-[150%] left-0 flex items-center justify-center group-hover:translate-x-[0%] group-hover:translate-y-[0%]">
                  <ArrowRight color="white" />
                </div>
              </span>
            </div>
          </Link>
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

      {/* Autoplay indicator dots
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {collections.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== current) {
                navigate(index > current ? NEXT : PREV);
              }
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current 
                ? 'bg-white w-8' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div> */}
            <div className="size-full z-10 bg-black/20 inset-0 absolute"></div>

    </div>
  );
};

export default Journey;
