/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        helvetica: ["Helvetica", "Arial", "sans-serif"],
      },
    },
    colors: {
      primary: {
        light: "var(--primary-light, #e0f2fe)", // Fundo sutil
        default: "var(--primary-default, #1e40af)", // Destaque principal
        dark: "var(--primary-dark, #1e3a8a)", // Hover/foco
      },
      neutral: {
        white: "var(--neutral-white, #ffffff)", // Branco puro
        light: "var(--neutral-light, #f3f4f6)", // Cinza claro
        medium: "var(--neutral-medium, #6b7280)", // Cinza médio
        dark: "var(--neutral-dark, #374151)", // Cinza escuro
        black: "var(--neutral-black, #111827)", // Quase preto
      },
      accent: {
        light: "var(--accent-light, #dcfce7)", // Fundo sutil
        default: "var(--accent-default, #15803d)", // Verde principal
        dark: "var(--accent-dark, #166534)", // Hover/foco
      },
      secondary: {
        default: "var(--secondary-default, #6b7280)", // Cinza-azulado
        dark: "var(--secondary-dark, #4b5563)", // Hover/foco
      },
      danger: {
        default: "var(--danger-default, #dc2626)", // Vermelho principal
        dark: "var(--danger-dark, #b91c1c)", // Hover/foco
      },
      overlay: {
        black: "var(--overlay-black, rgba(17, 24, 39, 0.5))", // Overlay sutil
      },
      focus: {
        default: "var(--focus-default, #60a5fa)", // Anel de foco
      },
    },
  },
  plugins: [],
};
