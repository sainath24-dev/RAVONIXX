import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      black: "#000000",
      void: "var(--bg-void)",
      panel: {
        DEFAULT: "var(--bg-panel)",
        raised: "var(--bg-panel-raised)",
      },
      hairline: "var(--border-hairline)",
      primary: {
        DEFAULT: "var(--accent-primary)",
        hi: "var(--accent-primary-hi)",
      },
      live: "var(--accent-live)",
      info: "var(--accent-info)",
      tier: {
        bronze: "var(--tier-bronze)",
        silver: "var(--tier-silver)",
        gold: "var(--tier-gold)",
        diamond: "var(--tier-diamond)",
      },
      text: {
        primary: "var(--text-primary)",
        muted: "var(--text-muted)",
        dim: "var(--text-dim)",
      },
    },
    fontFamily: {
      display: ["var(--font-display)", "sans-serif"],
      body: ["var(--font-body)", "sans-serif"],
    },
    extend: {
      borderRadius: {
        none: "0",
        DEFAULT: "2px",
        sm: "2px",
        md: "4px",
        lg: "4px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;

