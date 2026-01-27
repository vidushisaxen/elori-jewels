'use client';
import Image from 'next/image';
import { useState } from 'react';

export function Gallery({
  images,
}: {
  images: { src: string; altText: string }[];
}) {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const LENS_SIZE = 150;

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    src: string
  ) => {
    // turn on zoom on first mouse move (and ensure correct image)
    if (!showZoom || activeImage !== src) {
      setShowZoom(true);
      setActiveImage(src);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // zoom background positioning as %
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // lens clamped inside image
    const lensX = Math.max(
      0,
      Math.min(x - LENS_SIZE / 2, rect.width - LENS_SIZE)
    );
    const lensY = Math.max(
      0,
      Math.min(y - LENS_SIZE / 2, rect.height - LENS_SIZE)
    );

    setZoomPosition({ x: xPercent, y: yPercent });
    setLensPosition({ x: lensX, y: lensY });
  };

  const selectedImage = images[selectedIndex];
  const isActive = showZoom && activeImage === selectedImage?.src;

  return (
    <div className="flex h-screen">
      {/* Thumbnail sidebar */}
      <div className="flex flex-col gap-2 p-2 absolute z-5 top-1/2 bg-black/30 rounded-md left-5 backdrop-blur-sm -translate-y-1/2 overflow-y-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative w-16 h-16 flex-shrink-0 cursor-pointer overflow-hidden border-2 transition-all duration-200 ${
              selectedIndex === index
                ? 'border-white'
                : 'border-transparent '
            }`}
          >
            <Image
              src={image.src}
              alt={image.altText}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image display */}
      <div className="flex-1 relative">
        <div
          className="relative w-full h-full overflow-hidden bg-zinc-50"
          onMouseMove={(e) => handleMouseMove(e, selectedImage.src)}
          onMouseLeave={() => {
            setShowZoom(false);
            setActiveImage('');
          }}
          style={{ cursor: isActive ? 'none' : 'default' }}
        >
          <Image
            className="h-full w-full object-cover"
            fill
            sizes="50vw"
            alt={selectedImage.altText}
            src={selectedImage.src}
            priority
          />

          {/* Lens Overlay */}
          {isActive && (
            <div
              className="absolute border-2 border-gray-400 pointer-events-none bg-white/30"
              style={{
                width: `${LENS_SIZE}px`,
                height: `${LENS_SIZE}px`,
                left: `${lensPosition.x}px`,
                top: `${lensPosition.y}px`,
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '10px 10px',
              }}
            />
          )}
        </div>

        {/* Zoomed View Overlay */}
        {showZoom && activeImage && (
          <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 w-170 h-200 border-2 border-gray-400 bg-white shadow-2xl z-50 rounded-lg overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
