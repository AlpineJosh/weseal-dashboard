import { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
  darkMode: ["class"],
  content: ["src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        white: colors.white,
        neutral: colors.slate,
        primary: colors.teal,
        secondary: colors.blue,
        error: colors.red,
        success: colors.green,
        warning: colors.yellow,
      },
    },
  },
  plugins: [],
} satisfies Config;
