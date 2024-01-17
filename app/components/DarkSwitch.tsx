'use client'

import React, { useState, useEffect } from 'react';

// DarkSwitch component
const DarkSwitch = () => {
  // State to track dark mode
  const [darkMode, setDarkMode] = useState(false);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Use effect to update the class on body based on dark mode state
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="mb-2 mt-auto">
      <div className="flex h-[24px] w-[50px] cursor-pointer items-center justify-between rounded-lg border-[0.5px] border-solid bg-transparent transition-colors duration-300 border-fgMain-1000" onClick={toggleDarkMode}>
        <div className={`relative flex h-full w-[50%] items-center rounded-l-lg ${darkMode ? 'bg-fgMain-1000 text-fgMain-0' : ''}`}>
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            className="absolute left-[5px]"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Your SVG path for light mode */}
          </svg>
        </div>
        <div className={`relative flex h-full w-[50%] items-center rounded-r-lg ${darkMode ? '' : 'bg-fgMain-1000 text-fgMain-0'}`}>
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            className="absolute right-[5px]"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Your SVG path for dark mode */}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DarkSwitch;
