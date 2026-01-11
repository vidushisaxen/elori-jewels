"use client"
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

const NEXT = 1;
const PREV = -1;

const Journey = ({ collections }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const slidesRef = useRef([]);
  const slidesInnerRef = useRef([]);
  
  const slidesTotal = collections?.length || 0;

  useEffect(() => {
    if (!collections || collections.length === 0) return;

    // Preload images
    const imagePromises = collections.map(collection => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = collection.image?.url || collection.image?.src || '';
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(imagePromises).then(() => {
      setIsLoading(false);
    });
  }, [collections]);

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
  }, [isLoading, isAnimating, current]);

  const navigate = (direction) => {
    if (isAnimating) return false;
    setIsAnimating(true);

    const previous = current;
    const newCurrent =
      direction === 1
        ? current < slidesTotal - 1
          ? current + 1
          : 0
        : current > 0
        ? current - 1
        : slidesTotal - 1;

    const currentSlide = slidesRef.current[previous];
    const currentInner = slidesInnerRef.current[previous];
    const upcomingSlide = slidesRef.current[newCurrent];
    const upcomingInner = slidesInnerRef.current[newCurrent];

    gsap
      .timeline({
        onStart: () => {
          gsap.set(upcomingSlide, { zIndex: 99 });
          setCurrent(newCurrent);
        },
        onComplete: () => {
          gsap.set(upcomingSlide, { zIndex: 1 });
          setIsAnimating(false);
        },
      })
      .addLabel('start', 0)
      .fromTo(
        upcomingSlide,
        {
          autoAlpha: 1,
          scale: 0.1,
          xPercent: direction * 100,
        },
        {
          duration: 0.7,
          ease: 'expo',
          scale: 0.4,
          xPercent: 0,
        },
        'start'
      )
      .fromTo(
        upcomingInner,
        {
          filter: 'contrast(100%) saturate(100%)',
          transformOrigin: '100% 50%',
          scaleX: 4,
        },
        {
          duration: 0.7,
          ease: 'expo',
          scaleX: 1,
        },
        'start'
      )
      .fromTo(
        currentInner,
        {
          filter: 'contrast(100%) saturate(100%)',
        },
        {
          duration: 0.7,
          ease: 'expo',
          filter: 'contrast(120%) saturate(140%)',
        },
        'start'
      )
      .addLabel('middle', 'start+=0.6')
      .to(
        upcomingSlide,
        {
          duration: 1,
          ease: 'power4.inOut',
          scale: 1,
        },
        'middle'
      )
      .to(
        currentSlide,
        {
          duration: 1,
          ease: 'power4.inOut',
          scale: 0.98,
          autoAlpha: 0,
        },
        'middle'
      );
  };

  if (!collections || collections.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">No collections available</p>
      </div>
    );
  }

  const currentCollection = collections[current];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      )}
      {/* Navigation Buttons */}
      <nav className="absolute bottom-8 left-15 z-20 flex gap-4">
        <button
          onClick={() => navigate(PREV)}
          disabled={isAnimating}
          className="w-12 h-12 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl"
          aria-label="Previous slide"
        >
          ←
        </button>
        <button
          onClick={() => navigate(NEXT)}
          disabled={isAnimating}
          className="w-12 h-12 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl"
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
            ref={el => (slidesRef.current[index] = el)}
            className={`absolute inset-0 ${
              index === current ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              zIndex: index === current ? 1 : 0,
            }}
          >
            <div
              ref={el => (slidesInnerRef.current[index] = el)}
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${collection.image?.url || collection.image?.src || ''})`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Collection Info Overlay */}
      <div className="absolute inset-x-0 bottom-10 z-20 text-center px-6">
        <div className="max-w-2xl mx-auto">
          {/* <h2 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-wide">
            {currentCollection.title}
          </h2> */}
          <a
            href={`/collection/${currentCollection.handle}`}
            className="inline-block px-8 py-3 bg-black/10 backdrop-blur-sm text-white text-sm uppercase tracking-wider border border-white/30 hover:bg-white hover:text-black transition-all duration-300"
          >
            Explore Collection
          </a>
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-8 right-8 z-20 text-white text-sm font-light">
        <span className="text-2xl font-bold">{String(current + 1).padStart(2, '0')}</span>
        <span className="mx-2 opacity-60">/</span>
        <span className="opacity-60">{String(slidesTotal).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default Journey;