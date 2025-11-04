import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override Tailwind’s modern color functions to fix oklch() errors
        background: '#ffffff',
        foreground: '#000000',
      },
    },
  },
  plugins: [],
};

export default config;
