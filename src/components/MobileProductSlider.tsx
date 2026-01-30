"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SmoothySlider, { Slide, SmoothySliderRef } from "./SmoothySlider";
import Image from 'next/image';

interface ProductImage {
  src: string;
  altText: string;
}

interface MobileProductSliderProps {
  images: ProductImage[];
}

export default function MobileProductSlider({ images }: MobileProductSliderProps) {
  const sliderRef = useRef<SmoothySliderRef>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handlePrev = () => {
    sliderRef.current?.goToPrev();
  };

  const handleNext = () => {
    sliderRef.current?.goToNext();
  };

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <div className="relative">
        <SmoothySlider
          ref={sliderRef}
          className="py-4 w-full cursor-grab active:cursor-grabbing"
          config={{ infinite: true, snap: false }}
        >
          {images.map((image, index) => (
            <Slide key={index} className="w-full px-2">
              <div 
                className="relative w-full aspect-square overflow-hidden cursor-pointer"
                onClick={() => openGallery(index)}
              >
                <Image
                  src={image.src}
                  alt={image.altText}
                  fill
                  draggable={false}
                  className="object-cover select-none"
                  sizes="100vw"
                  priority={index === 0}
                />
              </div>
            </Slide>
          ))}
        </SmoothySlider>

        {/* Navigation buttons */}
        <button
          onClick={handlePrev}
          className="group absolute left-[2%] top-[50%] -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#C9A24D] backdrop-blur-sm flex items-center justify-center transition-all duration-300 border-2 border-[#C9A24D] hover:bg-white overflow-hidden"
          aria-label="Previous image"
        >
          <div className="translate-x-[150%] group-hover:translate-x-0 transition-transform duration-300">
            <ChevronLeft color="#C9A24D" className="w-6 h-6" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:-translate-x-[250%] transition-transform duration-300">
            <ChevronLeft color="white" className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={handleNext}
          className="group absolute right-[2%] top-[50%] -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-[#C9A24D] backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white overflow-hidden border-2 border-[#C9A24D]"
          aria-label="Next image"
        >
          <div className="-translate-x-[150%] group-hover:translate-x-0 transition-transform duration-300">
            <ChevronRight color="#C9A24D" className="w-6 h-6" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 group-hover:translate-x-[250%] transition-transform duration-300">
            <ChevronRight color="white" className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Close button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
            aria-label="Close gallery"
          >
            <X color="white" className="w-7 h-7" strokeWidth={1.5} />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-white text-sm bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
            {selectedImageIndex + 1} / {images.length}
          </div>

          {/* Main Image Display */}
          <div className="flex-1 flex items-center justify-center p-4 pt-20">
            <div className="relative w-full h-full max-w-4xl">
              <Image
                src={images[selectedImageIndex].src}
                alt={images[selectedImageIndex].altText}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 p-4 overflow-x-auto">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative w-20 h-20 flex-shrink-0 cursor-pointer rounded overflow-hidden transition-all duration-300 ${
                  index === selectedImageIndex 
                    ? 'ring-2 ring-white opacity-100' 
                    : 'opacity-60 hover:opacity-80'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <Image
                  src={image.src}
                  alt={image.altText}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}