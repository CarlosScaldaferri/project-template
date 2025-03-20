"use client";

import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
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
    <ListItem disablePadding>
      <ListItemButton onClick={toggleTheme}>
        <ListItemIcon className="text-light-text dark:text-dark-text">
          {isDark ? <FaSun size={24} /> : <FaMoon size={24} />}
        </ListItemIcon>
        <ListItemText
          primary="Tema"
          className="text-light-text dark:text-dark-text"
        />
      </ListItemButton>
    </ListItem>
  );
}
