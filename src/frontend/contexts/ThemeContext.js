"use client";
import { createContext, useContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");
  const [systemTheme, setSystemTheme] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Configura o listener do tema do sistema
  useEffect(() => {
    setIsMounted(true);

    const updateSystemTheme = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setSystemTheme(isDark ? "dark" : "light");
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateSystemTheme);
    updateSystemTheme();

    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  // Aplica o tema selecionado
  useEffect(() => {
    if (!isMounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");

    const effectiveTheme = theme === "system" ? systemTheme : theme;
    if (effectiveTheme) {
      root.classList.add(effectiveTheme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, systemTheme, isMounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, systemTheme, isMounted }}>
      {children}
    </ThemeContext.Provider>
  );
};
