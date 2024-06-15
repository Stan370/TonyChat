"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";

const Carousel = ({
  children: slides,
  autoPlay = false,
  autoSlideInterval = 4000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const handleNextSlide = () => {
    let newSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    setCurrentSlide(newSlide);
  };

  const handlePrevSlide = () => {
    let newSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    setCurrentSlide(newSlide);
  };

  useEffect(() => {
    if (!autoPlay) return () => clearInterval(slideInterval);
    const slideInterval = setInterval(handleNextSlide, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [currentSlide]);

  return (
    <div className="overflow-hidden relative w-1/4 ">
      <div
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        className="flex w-full  transition-transform duration-500 ease-in-out transform "
      >
        {slides.map((slide, index) => (
            <img
              key={index}
              className="flex-shrink-0 w-full md:min-h-96"
              src={slide}
              alt={`Slide ${index + 1}`}
            />
        ))}
      </div>

      <div className="absolute flex justify-between items-center inset-0">
        <button onClick={handlePrevSlide}>
          <ChevronLeft />
        </button>
        <button onClick={handleNextSlide}>
          <ChevronRight />
        </button>
      </div>
      <div className="absolute left-0 right-0 bottom-2 ">
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
