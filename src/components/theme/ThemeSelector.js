"use client";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const themes = {
  light: {
    primary: { light: "#e0f2fe", default: "#1e40af", dark: "#1e3a8a" },
    neutral: {
      white: "#ffffff",
      light: "#f3f4f6",
      medium: "#d1d5db",
      dark: "#374151",
      black: "#111827",
    },
    accent: { light: "#dcfce7", default: "#15803d", dark: "#166534" },
    secondary: { default: "#6b7280", dark: "#4b5563" },
    danger: { default: "#dc2626", dark: "#b91c1c" },
    overlay: { black: "rgba(17, 24, 39, 0.5)" },
    focus: { default: "#60a5fa" },
    gradient: { start: "#e0f2fe", end: "#dcfce7" }, // primary.light -> accent.light
  },
  default: {
    primary: { light: "#dbeafe", default: "#2563eb", dark: "#1e40af" },
    neutral: {
      white: "#ffffff",
      light: "#f9fafb",
      medium: "#9ca3af",
      dark: "#6b7280",
      black: "#1f2937",
    },
    accent: { light: "#d1fae5", default: "#16a34a", dark: "#15803d" },
    secondary: { default: "#9ca3af", dark: "#6b7280" },
    danger: { default: "#ef4444", dark: "#dc2626" },
    overlay: { black: "rgba(31, 41, 55, 0.4)" },
    focus: { default: "#93c5fd" },
    gradient: { start: "#dbeafe", end: "#d1fae5" },
  },
  dark: {
    primary: { light: "#bfdbfe", default: "#3b82f6", dark: "#2563eb" },
    neutral: {
      white: "#f3f4f6",
      light: "#374151",
      medium: "#6b7280",
      dark: "#4b5563",
      black: "#1f2937",
    },
    accent: { light: "#bbf7d0", default: "#22c55e", dark: "#16a34a" },
    secondary: { default: "#9ca3af", dark: "#6b7280" },
    danger: { default: "#f87171", dark: "#ef4444" },
    overlay: { black: "rgba(31, 41, 55, 0.8)" },
    focus: { default: "#60a5fa" },
    gradient: { start: "#bfdbfe", end: "#bbf7d0" },
  },
  sunrise: {
    primary: { light: "#ffedd5", default: "#fb923c", dark: "#c2410c" },
    neutral: {
      white: "#ffffff",
      light: "#fef3c7",
      medium: "#f59e0b",
      dark: "#b45309",
      black: "#78350f",
    },
    accent: { light: "#fef9c3", default: "#eab308", dark: "#a16207" },
    secondary: { default: "#d97706", dark: "#92400e" },
    danger: { default: "#dc2626", dark: "#991b1b" },
    overlay: { black: "rgba(120, 53, 15, 0.5)" },
    focus: { default: "#facc15" },
    gradient: { start: "#ffedd5", end: "#fef9c3" },
  },
  ocean: {
    primary: { light: "#c7d2fe", default: "#4f46e5", dark: "#312e81" },
    neutral: {
      white: "#eef2ff",
      light: "#e0e7ff",
      medium: "#818cf8",
      dark: "#3730a3",
      black: "#1e1b4b",
    },
    accent: { light: "#7dd3fc", default: "#0284c7", dark: "#0369a1" },
    secondary: { default: "#4c51bf", dark: "#3c366b" },
    danger: { default: "#ef4444", dark: "#b91c1c" },
    overlay: { black: "rgba(30, 27, 75, 0.5)" },
    focus: { default: "#3b82f6" },
    gradient: { start: "#c7d2fe", end: "#7dd3fc" },
  },
  forest: {
    primary: { light: "#d1fae5", default: "#10b981", dark: "#065f46" },
    neutral: {
      white: "#f0fdf4",
      light: "#d1fae5",
      medium: "#34d399",
      dark: "#047857",
      black: "#064e3b",
    },
    accent: { light: "#86efac", default: "#22c55e", dark: "#15803d" },
    secondary: { default: "#059669", dark: "#065f46" },
    danger: { default: "#dc2626", dark: "#991b1b" },
    overlay: { black: "rgba(6, 94, 70, 0.5)" },
    focus: { default: "#4ade80" },
    gradient: { start: "#d1fae5", end: "#86efac" },
  },
  neon: {
    primary: { light: "#ff0", default: "#ff0080", dark: "#800080" },
    neutral: {
      white: "#fff",
      light: "#d1d5db",
      medium: "#4b5563",
      dark: "#1f2937",
      black: "#000",
    },
    accent: { light: "#0ff", default: "#00f", dark: "#000080" },
    secondary: { default: "#ff4500", dark: "#b22222" },
    danger: { default: "#ff0000", dark: "#8b0000" },
    overlay: { black: "rgba(0, 0, 0, 0.8)" },
    focus: { default: "#00ff00" },
    gradient: { start: "#ff0", end: "#0ff" },
  },
  volcano: {
    primary: { light: "#ffb199", default: "#ff4500", dark: "#a62c00" },
    neutral: {
      white: "#ffffff",
      light: "#ffd9b3",
      medium: "#e65c00",
      dark: "#993d00",
      black: "#4d1f00",
    },
    accent: { light: "#ff704d", default: "#d63031", dark: "#9b2a00" },
    secondary: { default: "#ff5733", dark: "#c70039" },
    danger: { default: "#e60000", dark: "#800000" },
    overlay: { black: "rgba(77, 31, 0, 0.7)" },
    focus: { default: "#ff4500" },
    gradient: { start: "#ffb199", end: "#ff704d" },
  },
  desert: {
    primary: { light: "#ffdead", default: "#d2b48c", dark: "#8b5a2b" },
    neutral: {
      white: "#fdf5e6",
      light: "#faebd7",
      medium: "#cd853f",
      dark: "#8b4513",
      black: "#5a3e2b",
    },
    accent: { light: "#e6c2a4", default: "#b87333", dark: "#8a4b08" },
    secondary: { default: "#c19a6b", dark: "#795c34" },
    danger: { default: "#a52a2a", dark: "#5a1c1c" },
    overlay: { black: "rgba(90, 62, 43, 0.7)" },
    focus: { default: "#ffa07a" },
    gradient: { start: "#ffdead", end: "#e6c2a4" },
  },
  galaxy: {
    primary: { light: "#b39ddb", default: "#673ab7", dark: "#4527a0" },
    neutral: {
      white: "#e0e0e0",
      light: "#b0bec5",
      medium: "#546e7a",
      dark: "#263238",
      black: "#000a12",
    },
    accent: { light: "#80d8ff", default: "#00b8d4", dark: "#0097a7" },
    secondary: { default: "#7e57c2", dark: "#5e35b1" },
    danger: { default: "#d32f2f", dark: "#b71c1c" },
    overlay: { black: "rgba(0, 10, 18, 0.7)" },
    focus: { default: "#ffeb3b" },
    gradient: { start: "#b39ddb", end: "#80d8ff" },
  },
  samurai: {
    primary: { light: "#ffcccb", default: "#c62828", dark: "#8e0000" },
    neutral: {
      white: "#fff5e1",
      light: "#f4e1c1",
      medium: "#bf8040",
      dark: "#8b5a2b",
      black: "#4d2600",
    },
    accent: { light: "#ffd700", default: "#ffbf00", dark: "#b8860b" },
    secondary: { default: "#800000", dark: "#4b0000" },
    danger: { default: "#e60000", dark: "#b20000" },
    overlay: { black: "rgba(75, 0, 0, 0.7)" },
    focus: { default: "#ff0000" },
    gradient: { start: "#ffcccb", end: "#ffd700" },
  },
  space: {
    primary: { light: "#d1d5db", default: "#1e293b", dark: "#0f172a" },
    neutral: {
      white: "#f8fafc",
      light: "#e2e8f0",
      medium: "#64748b",
      dark: "#1e293b",
      black: "#0f172a",
    },
    accent: { light: "#3b82f6", default: "#1e40af", dark: "#1e3a8a" },
    secondary: { default: "#9333ea", dark: "#6b21a8" },
    danger: { default: "#ef4444", dark: "#b91c1c" },
    overlay: { black: "rgba(15, 23, 42, 0.8)" },
    focus: { default: "#a855f7" },
    gradient: { start: "#d1d5db", end: "#3b82f6" },
  },
  tropical: {
    primary: { light: "#fef9c3", default: "#facc15", dark: "#ca8a04" },
    neutral: {
      white: "#fffbe6",
      light: "#fef3c7",
      medium: "#f59e0b",
      dark: "#b45309",
      black: "#78350f",
    },
    accent: { light: "#86efac", default: "#22c55e", dark: "#15803d" },
    secondary: { default: "#06b6d4", dark: "#0369a1" },
    danger: { default: "#ef4444", dark: "#b91c1c" },
    overlay: { black: "rgba(120, 53, 15, 0.6)" },
    focus: { default: "#facc15" },
    gradient: { start: "#fef9c3", end: "#86efac" },
  },
};

const themeList = Object.entries(themes).map(([name, config]) => ({
  name,
  config,
}));

const applyTheme = (themeName) => {
  const theme = themes[themeName];
  Object.entries(theme).forEach(([category, values]) => {
    Object.entries(values).forEach(([variant, value]) => {
      document.documentElement.style.setProperty(
        `--${category}-${variant}`,
        value
      );
    });
  });
};

export default function ThemeSelector() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const currentTheme = themeList[selectedIndex];

  useEffect(() => {
    applyTheme(currentTheme.name);
  }, [selectedIndex]);

  const nextTheme = () => {
    setSelectedIndex((prevIndex) => (prevIndex + 1) % themeList.length);
  };

  return (
    <div className="flex flex-col items-center relative">
      <div
        className="w-6 h-6 text-sm select-none text-shadow rounded-full border border-spacing-1 border-primary-dark flex items-center justify-center text-center cursor-pointer bg-gradient-to-br from-primary-dark to-primary-light"
        style={{ color: currentTheme.config.neutral.white }}
        onClick={nextTheme}
      >
        {currentTheme.name}
      </div>
      <button
        className="flex items-center justify-center text-gray-700 hover:text-gray-900"
        onClick={() => setOpen(!open)}
      >
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute top-16 select-none bg-neutral-white shadow-lg text- p-2 flex flex-wrap gap-2 border border-gray-300 max-h-64 overflow-y-auto">
          {themeList.map((theme, index) => (
            <div
              key={theme.name}
              className={`w-12 h-12 rounded-full select-none flex items-center justify-center cursor-pointer text-sm transition ${
                selectedIndex === index
                  ? "ring-2 ring-primary-default"
                  : "opacity-80 hover:opacity-100"
              }`}
              style={{
                backgroundColor: theme.config.primary.light,
                color: theme.config.primary.dark,
              }}
              onClick={() => {
                setSelectedIndex(index);
                setOpen(false);
              }}
            >
              {theme.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
