"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Siderbar";
import RecommendedCarousel from "../components/RecommendedCarousel";
import Image from "next/image";
import { Bot, Agent } from "@/lib/types";

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

const categories = ["All", "Development", "Writing", "Business", "Education", "Analytics", "Design"];

export default function Store() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const handleUseBot = (bot: Bot) => {
    // Create a new agent with the bot's information
    const agentData: Agent = {
      id: bot.id,
      name: bot.name,
      description: bot.description,
      avatar: bot.avatar,
      category: bot.category,
      tags: bot.tags,
      author: bot.author,
      systemPrompt: `You are ${bot.name}, ${bot.description}. You specialize in ${bot.tags.join(', ')}. Please help the user with their requests in a professional and helpful manner.`
    };

    // Store the agent data in localStorage for the chat page to use
    localStorage.setItem('selectedAgent', JSON.stringify(agentData));
    
    // Navigate to chat page
    router.push('/chat');
  };

  const filteredBots = mockBots
    .filter(bot => {
      const matchesCategory = selectedCategory === "All" || bot.category === selectedCategory;
      const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bot.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "downloads":
          return b.downloads - a.downloads;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return b.downloads - a.downloads;
      }
    });

  return (
    <div className="relative min-h-screen flex flex-row bg-gray-50 dark:bg-[#17171a] dark:text-red-50">
      <Sidebar />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Bot Store
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover and deploy AI-powered chatbots for your needs
          </p>
        </div>

        {/* Recommended Agents Carousel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recommended Agents
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6">
            <RecommendedCarousel 
              autoPlay={true}
              autoSlideInterval={5000}
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBots.map((bot) => (
            <div
              key={bot.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-600 transition-shadow duration-300"
            >
              {/* Bot Image */}
              <div className="h-48 bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                <Image
                  src={bot.avatar}
                  alt={bot.name}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              </div>

              {/* Bot Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {bot.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    bot.price === "free" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  }`}>
                    {bot.price === "free" ? "Free" : "Premium"}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {bot.description}
                </p>

                {/* Rating and Downloads */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(bot.rating)
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                      {bot.rating}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {bot.downloads.toLocaleString()} downloads
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {bot.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author */}
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  by {bot.author}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUseBot(bot)}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
                  >
                    {bot.price === "free" ? "Use Bot" : "Try Free"}
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBots.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 9c-2.34 0-4.29-1.009-5.824-2.709"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No bots found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

