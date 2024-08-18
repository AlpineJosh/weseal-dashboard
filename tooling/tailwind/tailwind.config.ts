import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import aria from "tailwindcss-react-aria-components";

const config: Config = {
  darkMode: ["selector"],
  content: ["src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    colors: {
      border: "hsl(var(--border) / <alpha-value>)",
      input: "hsl(var(--input) / <alpha-value>)",
      ring: "hsl(var(--ring) / <alpha-value>)",
      background: "hsl(var(--background) / <alpha-value>)",
      foreground: "hsl(var(--foreground) / <alpha-value>)",
      primary: {
        DEFAULT: "hsl(var(--primary) / <alpha-value>)",
        muted: "hsl(var(--primary-muted) / <alpha-value>)",
        "muted-foreground":
          "hsl(var(--primary-muted-foreground) / <alpha-value>)",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
        muted: "hsl(var(--secondary-muted) / <alpha-value>)",
        "muted-foreground":
          "hsl(var(--secondary-muted-foreground) / <alpha-value>)",
      },
      accent: {
        DEFAULT: "hsl(var(--accent) / <alpha-value>)",
        muted: "hsl(var(--accent-muted) / <alpha-value>)",
        "muted-foreground":
          "hsl(var(--accent-muted-foreground) / <alpha-value>)",
      },
      muted: {
        DEFAULT: "hsl(var(--muted) / <alpha-value>)",
        foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
      },
      card: "hsl(var(--card) / <alpha-value>)",
    },
    borderRadius: {
      lg: `var(--radius)`,
      md: `calc(var(--radius) - 2px)`,
      sm: "calc(var(--radius) - 4px)",
      full: "9999px",
    },
    extend: {
      outlineColor: {
        DEFAULT: "hsl(var(--ring) / <alpha-value>)",
      },
      borderColor: {
        DEFAULT: "hsl(var(--border) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
    },
  },
  plugins: [animate, aria({ prefix: "rac" })],
};

export default config satisfies Config;
