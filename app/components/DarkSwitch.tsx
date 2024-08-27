"use client";

import React, { useState, useEffect } from "react";

// DarkSwitch component
const DarkSwitch = () => {
  // State to track dark mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined" ) {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  
  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Use effect to update the class on body based on dark mode state
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }
  }, [darkMode]);

  return (
    <div className="mb-auto">
      <div
        className="flex mt-8 md:mt-96 cursor-pointer items-center justify-between rounded-lg border-[0.5px] border-solid bg-transparent transition-colors duration-300 border-gray-1000"
      >
        <div
          className={`relative flex h-full w-[50%] items-center rounded-l-lg ${
            darkMode ? "bg-gray-800 text-gray-100" : ""
          }`}
          onClick={() => setDarkMode(false)}
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 "
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            />
          </svg>
        </div>
        <div
          className={`relative flex h-full w-[50%] items-center rounded-r-lg ${
            darkMode ? "" : "bg-gray-1000 text-gray-700"
          }`}
          onClick={() => setDarkMode(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DarkSwitch;
