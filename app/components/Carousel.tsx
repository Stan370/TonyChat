"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import Image from "next/image";

const Carousel = ({
  children: slides,
  autoPlay = false,
  autoSlideInterval = 4000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNextSlide = useCallback(() => {
    let newSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    setCurrentSlide(newSlide);
  }, [currentSlide, slides.length]);

  const handlePrevSlide = () => {
    let newSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    setCurrentSlide(newSlide);
  };

  useEffect(() => {
    if (!autoPlay) return;

    const slideInterval = setInterval(handleNextSlide, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [currentSlide, autoPlay, autoSlideInterval, handleNextSlide]);

  return (
    <div className="overflow-hidden relative w-1/4">
      <div
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        className="flex w-full transition-transform duration-500 ease-in-out transform" 
      >
        {slides.map((slide, index) => (
          <Image
            key={index}
            className="flex-shrink-0 rounded-xl shadow hover:shadow-lg w-full md:min-h-96"
            src={slide}
            alt={`Slide ${index + 1}`}
            width={400}
            height={400}
            onClick={() => {
              if (index === 2) {
                window.location.href = 'https://chatgpt.com/';
              }
            }}
          />
        ))}
      </div>

      <div className="absolute flex justify-between items-center inset-0">
        <button onClick={handlePrevSlide} aria-label="Previous Slide">
          <ChevronLeft />
        </button>
        <button onClick={handleNextSlide} aria-label="Next Slide">
          <ChevronRight />
        </button>
      </div>
      <div className="absolute left-0 right-0 bottom-2">
        <div className="flex justify-center items-center gap-4">
          {slides.map((_slide, index) => (
            <div
              key={index}
              onClick={() => {
                setCurrentSlide(index);
              }}
              className={`transition-all w-1.5 h-1.5 bg-white rounded-full ${
                currentSlide === index ? "p-0.5" : "bg-opacity-50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;