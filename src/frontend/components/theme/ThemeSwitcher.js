"use client";
import { useTheme } from "@/frontend/hooks/useTheme";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-light-background-sidebar dark:bg-dark-background-sidebar shadow-sm">
      <button
        onClick={() => setTheme("system")}
        className={`p-2 w-1/3 flex justify-center transition-all duration-200 ${
          theme === "system"
            ? "bg-light-primary text-light-text-button shadow-md"
            : "text-light-icon hover:bg-light-accent/20"
        } dark:${
          theme === "system"
            ? "bg-dark-primary text-dark-text-button"
            : "text-dark-icon hover:bg-dark-accent/20"
        }`}
        aria-label="Usar tema do sistema"
        title="Tema do sistema"
      >
        <FiMonitor className="w-5 h-5" />
      </button>

      <button
        onClick={() => setTheme("light")}
        className={`p-2 w-1/3 flex justify-center transition-all duration-200 ${
          theme === "light"
            ? "bg-light-primary text-light-text-button shadow-md"
            : "text-light-icon hover:bg-light-accent/20"
        } dark:${
          theme === "light"
            ? "bg-dark-primary text-dark-text-button"
            : "text-dark-icon hover:bg-dark-accent/20"
        }`}
        aria-label="Usar tema claro"
        title="Tema claro"
      >
        <FiSun className="w-5 h-5" />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`p-2 w-1/3 flex justify-center transition-all duration-200 ${
          theme === "dark"
            ? "bg-light-primary text-light-text-button shadow-md"
            : "text-light-icon hover:bg-light-accent/20"
        } dark:${
          theme === "dark"
            ? "bg-dark-primary text-dark-text-button"
            : "text-dark-icon hover:bg-dark-accent/20"
        }`}
        aria-label="Usar tema escuro"
        title="Tema escuro"
      >
        <FiMoon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
