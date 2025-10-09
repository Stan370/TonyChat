"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import Image from "next/image";

interface RecommendedAgent {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
}

interface Bot {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  rating: number;
  downloads: number;
  price: "free" | "premium";
  tags: string[];
  author: string;
}

interface RecommendedCarouselProps {
  autoPlay?: boolean;
  autoSlideInterval?: number;
}

const RecommendedCarousel = ({
  autoPlay = false,
  autoSlideInterval = 5000,
}: RecommendedCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Bot data moved from store page
  const mockBots: Bot[] = [
    {
      id: "1",
      name: "Tonychat",
      description: "AI-powered coding assistant that helps with debugging, code review, and programming best practices.",
      category: "Development",
      avatar: "/user.jpg",
      rating: 4.8,
      downloads: 12500,
      price: "free",
      tags: ["coding", "debugging", "review"],
      author: "DevTeam"
    },
    {
      id: "2",
      name: "Content Writer",
      description: "Professional content creation bot for blogs, articles, and marketing copy.",
      category: "Writing",
      avatar: "/cat.png",
      rating: 4.6,
      downloads: 8900,
      price: "premium",
      tags: ["writing", "content", "marketing"],
      author: "ContentPro"
    },
    {
      id: "3",
      name: "Customer Support",
      description: "24/7 customer service bot with multilingual support and ticket management.",
      category: "Business",
      avatar: "/home.png",
      rating: 4.7,
      downloads: 15600,
      price: "premium",
      tags: ["support", "customer", "service"],
      author: "SupportAI"
    },
    {
      id: "4",
      name: "Language Tutor",
      description: "Interactive language learning companion with conversation practice and grammar help.",
      category: "Education",
      avatar: "/1.jpg",
      rating: 4.9,
      downloads: 22100,
      price: "free",
      tags: ["language", "learning", "education"],
      author: "EduBot"
    },
    {
      id: "5",
      name: "Data Analyst",
      description: "Advanced data analysis and visualization bot for business intelligence.",
      category: "Analytics",
      avatar: "/3.jpg",
      rating: 4.5,
      downloads: 6800,
      price: "premium",
      tags: ["data", "analytics", "visualization"],
      author: "DataPro"
    },
    {
      id: "6",
      name: "Creative Designer",
      description: "AI design assistant for logos, graphics, and creative visual content.",
      category: "Design",
      avatar: "/reddit.png",
      rating: 4.4,
      downloads: 11200,
      price: "premium",
      tags: ["design", "creative", "graphics"],
      author: "DesignAI"
    }
  ];

  // Recommended agents data
  const recommendedAgents: RecommendedAgent[] = [
    {
      id: "1",
      name: "Tonychat",
      description: "AI-powered coding assistant that helps with debugging, code review, and programming best practices.",
      image: "/user.jpg",
      category: "Development",
      rating: 4.8
    },
    {
      id: "4", 
      name: "Language Tutor",
      description: "Interactive language learning companion with conversation practice and grammar help.",
      image: "/1.jpg",
      category: "Education",
      rating: 4.9
    },
    {
      id: "2",
      name: "Content Writer",
      description: "Professional content creation bot for blogs, articles, and marketing copy.",
      image: "/cat.png", 
      category: "Writing",
      rating: 4.6
    }
  ];

  const handleUseBot = (agent: RecommendedAgent) => {
    console.log('handleUseBot clicked for agent:', agent.name);
    
    // Find the corresponding bot from the bots array
    const bot = mockBots.find(b => b.id === agent.id);
    console.log('Found bot:', bot);
    
    if (bot) {
      // Create a new agent with the bot's information
      const agentData = {
        id: `agent_${Date.now()}`,
        name: bot.name,
        description: bot.description,
        avatar: bot.avatar,
        category: bot.category,
        tags: bot.tags,
        author: bot.author,
        systemPrompt: `You are ${bot.name}, ${bot.description}. You specialize in ${bot.tags.join(', ')}. Please help the user with their requests in a professional and helpful manner.`
      };

      console.log('Agent data created:', agentData);

      // Store the agent data in localStorage for the chat page to use
      localStorage.setItem('selectedAgent', JSON.stringify(agentData));
      
      console.log('Navigating to chat page...');
      // Navigate to chat page
      window.location.href = '/chat';
    } else {
      console.error('Bot not found for agent:', agent);
    }
  };

  const handleNextSlide = () => {
    let newSlide = currentSlide === recommendedAgents.length - 1 ? 0 : currentSlide + 1;
    setCurrentSlide(newSlide);
  };

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
              <div className="flex justify-center mb-4">
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-white shadow-lg pointer-events-none"
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
