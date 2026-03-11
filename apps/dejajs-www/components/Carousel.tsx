'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@heroui/react';

export interface CarouselItem {
  id: string | number;
  content: React.ReactNode;
}

export interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showControls?: boolean;
  className?: string;
}

export default function Carousel({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
  showIndicators = true,
  showControls = true,
  className = '',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (autoPlay && !isHovered) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, isHovered, nextSlide]);

  if (!items || items.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No items to display</p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`Image carousel, slide ${currentIndex + 1} of ${items.length}`}
      className={`relative w-full overflow-hidden rounded-xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Content */}
      <div className="relative w-full" aria-live="polite" aria-atomic="true">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${items.length}`}
              className="w-full flex-shrink-0"
              aria-hidden={index !== currentIndex}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && items.length > 1 && (
        <>
          <Button
            isIconOnly
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm"
            size="sm"
            radius="full"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>

          <Button
            isIconOnly
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm"
            size="sm"
            radius="full"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-full overflow-x-auto px-4">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-white dark:bg-gray-200'
                  : 'w-2 bg-white/50 dark:bg-gray-400/50 hover:bg-white/80 dark:hover:bg-gray-300/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

