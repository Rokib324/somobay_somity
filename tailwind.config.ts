import type { Config } from "tailwindcss";

const config: Config = {
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
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
        },
        sidebar: {
          bg: "var(--sidebar-bg)",
          active: "var(--sidebar-active)",
          border: "var(--sidebar-border)",
          text: "var(--sidebar-text)",
          muted: "var(--sidebar-muted)",
        },
        card: "var(--card-bg)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
};
export default config;
