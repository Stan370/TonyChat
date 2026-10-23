"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "react-feather";

/** Toggles the `dark` class on <html>; the choice is saved in localStorage("theme"). */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage unavailable; the toggle still works for this page view
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`btn-icon ${className}`}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
