"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import Image from "next/image";
import { Bot, Agent } from "@/lib/types";

interface RecommendedCarouselProps {
  autoPlay?: boolean;
  autoSlideInterval?: number;
}

const RecommendedCarousel = ({
  autoPlay = false,
  autoSlideInterval = 5000,
}: RecommendedCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);


  // Recommended agents data (subset of mockBots)
  const recommendedAgents: Bot[] = [
    {
      id: "1",
      name: "Tonychat",
      description: "AI-powered coding assistant that helps with debugging, code review, and programming best practices.",
      avatar: "/user.jpg",
      category: "Development",
      rating: 4.8,
      downloads: 12500,
      price: "free",
      tags: ["coding", "debugging", "review"],
      author: "DevTeam"
    },
    {
      id: "4", 
      name: "Language Tutor",
      description: "Interactive language learning companion with conversation practice and grammar help.",
      avatar: "/1.jpg",
      category: "Education",
      rating: 4.9,
      downloads: 22100,
      price: "free",
      tags: ["language", "learning", "education"],
      author: "EduBot"
    },
    {
      id: "2",
      name: "Content Writer",
      description: "Professional content creation bot for blogs, articles, and marketing copy.",
      avatar: "/cat.png", 
      category: "Writing",
      rating: 4.6,
      downloads: 8900,
      price: "premium",
      tags: ["writing", "content", "marketing"],
      author: "ContentPro"
    }
  ];

  const handleUseBot = (agent: Bot) => {
    console.log('handleUseBot clicked for agent:', agent.name);
    
    // Create a new agent with the bot's information
    const agentData: Agent = {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      avatar: agent.avatar,
      category: agent.category,
      tags: agent.tags,
      author: agent.author,
      systemPrompt: `You are ${agent.name}, ${agent.description}. You specialize in ${agent.tags.join(', ')}. Please help the user with their requests in a professional and helpful manner.`
    };

    console.log('Agent data created:', agentData);

    // Store the agent data in localStorage for the chat page to use
    localStorage.setItem('selectedAgent', JSON.stringify(agentData));
    
    console.log('Navigating to chat page...');
    // Navigate to chat page
    window.location.href = '/chat';
  };

  const handleNextSlide = useCallback(() => {
    let newSlide = currentSlide === recommendedAgents.length - 1 ? 0 : currentSlide + 1;
    setCurrentSlide(newSlide);
  }, [currentSlide, recommendedAgents.length]);

  const handlePrevSlide = () => {
    let newSlide = currentSlide === 0 ? recommendedAgents.length - 1 : currentSlide - 1;
    setCurrentSlide(newSlide);
  };

  useEffect(() => {
    if (!autoPlay) return;

    const slideInterval = setInterval(handleNextSlide, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [currentSlide, autoPlay, autoSlideInterval, handleNextSlide]);

  return (
    <div className="overflow-hidden relative w-full max-w-4xl mx-auto">
      <div
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        className="flex w-full transition-transform duration-500 ease-in-out transform" 
      >
        {recommendedAgents.map((agent, index) => (
          <div key={agent.id} className="flex-shrink-0 w-full">
            <div 
              onClick={() => handleUseBot(agent)}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-8 text-white text-center cursor-pointer hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex justify-center mb-4 pointer-events-none">
                <Image
                  src={agent.avatar}
                  alt={agent.name}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-white shadow-lg "
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">{agent.name}</h3>
              <p className="text-lg mb-4 opacity-90">{agent.description}</p>
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(agent.rating)
                          ? "text-yellow-400"
                          : "text-white opacity-50"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-lg font-semibold">{agent.rating}</span>
              </div>
             
            </div>
          </div>
        ))}
      </div>

      <div className="absolute flex justify-between items-center inset-0 pointer-events-none">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handlePrevSlide();
          }} 
          aria-label="Previous Slide"
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 pointer-events-auto"
        >
          <ChevronLeft />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleNextSlide();
          }} 
          aria-label="Next Slide"
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 pointer-events-auto"
        >
          <ChevronRight />
        </button>
      </div>
      <div className="absolute left-0 right-0 bottom-2">
        <div className="flex justify-center items-center gap-4">
          {recommendedAgents.map((_agent, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(index);
              }}
              className={`transition-all w-1.5 h-1.5 bg-white rounded-full cursor-pointer hover:bg-opacity-75 ${
                currentSlide === index ? "p-0.5" : "bg-opacity-50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedCarousel;
