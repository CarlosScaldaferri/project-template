"use client";

import { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme
        ? savedTheme === "dark"
        : document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex flex-col justify-center items-center gap-1 min-h-[64px] w-full hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 text-light-text dark:text-dark-text"
    >
      <span className="flex items-center justify-center min-w-0">
        {isDark ? <FaSun size={24} /> : <FaMoon size={24} />}
      </span>
      <span className="text-xs">Tema</span>
    </button>
  );
}
