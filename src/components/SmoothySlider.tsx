'use client';

import { useEffect, useRef, ReactNode, forwardRef, useImperativeHandle } from 'react';
import Core, { CoreConfig } from 'smooothy';
import gsap from 'gsap';

/** Props for SmoothySlider component */
interface SmoothySliderProps {
  children: ReactNode;
  className?: string;
  config?: Partial<CoreConfig>;
}

export interface SmoothySliderRef {
  goToNext: () => void;
  goToPrev: () => void;
  goToIndex: (index: number) => void;
}

/** Reusable SmoothySlider component */
const SmoothySlider = forwardRef<SmoothySliderRef, SmoothySliderProps>(({
  children,
  className = '',
  config = {},
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<Core | null>(null);

  useEffect(() => {
    if (containerRef.current && !sliderRef.current) {
      const instance = new Core(containerRef.current, config);
      sliderRef.current = instance;
      gsap.ticker.add(instance.update.bind(instance));
    }

    return () => {
      if (sliderRef.current) {
        gsap.ticker.remove(sliderRef.current.update.bind(sliderRef.current));
        sliderRef.current.destroy();
        sliderRef.current = null;
      }
    };
  }, [config]);

  useImperativeHandle(ref, () => ({
    goToNext: () => {
      sliderRef.current?.goToNext();
    },
    goToPrev: () => {
      sliderRef.current?.goToPrev();
    },
    goToIndex: (index: number) => {
      sliderRef.current?.goToIndex(index);
    },
  }), []);

  return (
    <div
      className={`flex w-full overflow-x-hidden focus:outline-none ${className}`}
      ref={containerRef}
    >
      {children}
    </div>
  );
});

SmoothySlider.displayName = 'SmoothySlider';

export default SmoothySlider;

/** Slide wrapper component for consistent styling */
interface SlideProps {
  children: ReactNode;
  className?: string;
}

export function Slide({ children, className = '' }: SlideProps) {
  return (
    <div className={`shrink-0 ${className}`}>
      {children}
    </div>
  );
}

/** Reusable hook for smooothy slider (standalone usage) */
export function useSmooothy(config: Partial<CoreConfig> = {}) {
  const sliderRef = useRef<HTMLElement | null>(null);
  const instanceRef = useRef<Core | null>(null);

  const refCallback = (node: HTMLElement | null) => {
    if (node && !instanceRef.current) {
      const instance = new Core(node, config);
      gsap.ticker.add(instance.update.bind(instance));
      instanceRef.current = instance;
    }
    sliderRef.current = node;
  };

  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        gsap.ticker.remove(instanceRef.current.update.bind(instanceRef.current));
        instanceRef.current.destroy();
      }
    };
  }, []);

  return { ref: refCallback, slider: instanceRef };
}
