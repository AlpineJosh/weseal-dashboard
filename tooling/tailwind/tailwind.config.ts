import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";
import aria from "tailwindcss-react-aria-components";

const config: Config = {
  darkMode: ["selector"],
  content: ["src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    colors: {
      transparent: "hsla(0, 0%, 0%, 0)",
      white: "hsl(var(--white) / <alpha-value>)",
      ring: "hsl(var(--ring) / <alpha-value>)",
      content: {
        DEFAULT: "hsl(var(--content) / <alpha-value>)",
        muted: "hsl(var(--content-muted) / <alpha-value>)",
      },
      background: {
        DEFAULT: "hsl(var(--background) / <alpha-value>)",
        muted: "hsl(var(--background-muted) / <alpha-value>)",
        popover: "hsl(var(--background-popover) / <alpha-value>)",
      },
      icon: {
        DEFAULT: "hsl(var(--icon) / <alpha-value>)",
        muted: "hsl(var(--icon-muted) / <alpha-value>)",
      },
      primary: {
        DEFAULT: "hsl(var(--primary) / <alpha-value>)",
        border: "hsl(var(--primary-border) / <alpha-value>)",
        text: "hsl(var(--primary-text) / <alpha-value>)",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
        border: "hsl(var(--destructive-border) / <alpha-value>)",
        text: "hsl(var(--destructive-text) / <alpha-value>)",
      },
      color: {
        DEFAULT: "hsl(var(--color) / <alpha-value>)",
        border: "hsl(var(--color-border) / <alpha-value>)",
        text: "hsl(var(--color-text) / <alpha-value>)",
      },
    },
    borderRadius: {
      xl: "var(--radius) + 2px",
      lg: `var(--radius)`,
      md: `calc(var(--radius) - 2px)`,
      sm: "calc(var(--radius) - 4px)",
      full: "9999px",
    },
    // fontSize: {
    //   xs: "var(--f-xs)",
    //   sm: "var(--f-sm)",
    //   base: "var(--f-base)",
    //   lg: "var(--f-lg)",
    //   xl: "var(--f-xl)",
    //   "2xl": "var(--f-2xl)",
    //   "3xl": "var(--f-3xl)",
    //   "4xl": "var(--f-4xl)",
    // },
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
  plugins: [animate, aria({ prefix: "rac" }), typography],
};

export default config satisfies Config;
