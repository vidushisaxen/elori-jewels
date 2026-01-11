'use client';
import Image from 'next/image';
import { useState } from 'react';

export function Gallery({ images }: { images: { src: string; altText: string }[] }) {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [activeImage, setActiveImage] = useState<string>('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentage for zoomed image
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    // Calculate lens position (centered on cursor)
    const lensSize = 150;
    const lensX = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize));
    const lensY = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize));
    
    setZoomPosition({ x: xPercent, y: yPercent });
    setLensPosition({ x: lensX, y: lensY });
  };

  return (
    <div className="flex flex-col">
      {images.map((image, index) => (
        <div 
          key={index}
          className="relative w-full h-screen overflow-hidden bg-zinc-50 flex-shrink-0"
          onMouseEnter={() => {
            setShowZoom(true);
            setActiveImage(image.src);
          }}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
          style={{ cursor: showZoom && activeImage === image.src ? 'none' : 'default' }}
        >
          <Image
            className="h-full w-full object-cover"
            fill
            sizes="50vw"
            alt={image.altText}
            src={image.src}
            priority={index === 0}
          />
          
          {/* Lens Overlay with grid */}
          {showZoom && activeImage === image.src && (
            <div 
              className="absolute w-37.5 h-37.5 border-2 border-gray-400 pointer-events-none bg-white/30"
              style={{
                left: `${lensPosition.x}px`,
                top: `${lensPosition.y}px`,
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '10px 10px'
              }}
            />
          )}
        </div>
      ))}

      {/* Zoomed View Overlay on Right Side */}
      {showZoom && activeImage && (
        <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 w-170 h-200 border-2 border-gray-400 bg-white shadow-2xl z-50 rounded-lg overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '250%',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>
      )}
    </div>
  );
}