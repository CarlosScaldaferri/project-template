"use client";
import { useTheme } from "@/frontend/hooks/useTheme";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-4 p-2 rounded-lg bg-system-background-sidebar dark:bg-dark-background-sidebar shadow-sm">
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md transition-all duration-200 ${
          theme === "system"
            ? "bg-system-primary text-system-text-button shadow-md"
            : "text-system-icon hover:bg-system-accent/20"
        } dark:${
          theme === "system"
            ? "bg-dark-primary text-dark-text-button"
            : "text-dark-icon hover:bg-dark-accent/20"
        }`}
        aria-label="Usar tema do sistema"
        title="Tema do sistema"
      >
        <Monitor className="w-5 h-5" />
      </button>

      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-all duration-200 ${
          theme === "light"
            ? "bg-system-primary text-system-text-button shadow-md"
            : "text-system-icon hover:bg-system-accent/20"
        } dark:${
          theme === "light"
            ? "bg-dark-primary text-dark-text-button"
            : "text-dark-icon hover:bg-dark-accent/20"
        }`}
        aria-label="Usar tema claro"
        title="Tema claro"
      >
        <Sun className="w-5 h-5" />
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-all duration-200 ${
          theme === "dark"
            ? "bg-system-primary text-system-text-button shadow-md"
            : "text-system-icon hover:bg-system-accent/20"
        } dark:${
          theme === "dark"
            ? "bg-dark-primary text-dark-text-button"
            : "text-dark-icon hover:bg-dark-accent/20"
        }`}
        aria-label="Usar tema escuro"
        title="Tema escuro"
      >
        <Moon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
