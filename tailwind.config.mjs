/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
      },
      colors: {
        primary: {
          light: "var(--primary-light, #e0f2fe)",
          default: "var(--primary-default, #1e40af)",
          dark: "var(--primary-dark, #1e3a8a)",
        },
        neutral: {
          white: "var(--neutral-white, #ffffff)",
          light: "var(--neutral-light, #f3f4f6)",
          medium: "var(--neutral-medium, #6b7280)",
          dark: "var(--neutral-dark, #374151)",
          black: "var(--neutral-black, #111827)",
        },
        accent: {
          light: "var(--accent-light, #dcfce7)",
          default: "var(--accent-default, #15803d)",
          dark: "var(--accent-dark, #166534)",
        },
        secondary: {
          default: "var(--secondary-default, #6b7280)",
          dark: "var(--secondary-dark, #4b5563)",
        },
        danger: {
          default: "var(--danger-default, #dc2626)",
          dark: "var(--danger-dark, #b91c1c)",
        },
        overlay: {
          black: "var(--overlay-black, rgba(17, 24, 39, 0.5))",
        },
        focus: {
          default: "var(--focus-default, #60a5fa)",
        },
        gradient: {
          start: "var(--gradient-start, var(--primary-light))", // Início do degradê
          end: "var(--gradient-end, var(--accent-light))", // Fim do degradê
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".text-shadow": {
          "text-shadow": "1px 1px 1px rgba(0, 0, 0, 0.9)",
        },
        ".text-shadow-md": {
          "text-shadow": "2px 2px 2px rgba(0, 0, 0, 1)",
        },
        ".text-shadow-lg": {
          "text-shadow": "3px 3px 3px rgba(0, 0, 0, 1)",
        },
      });
    },
  ],
};
