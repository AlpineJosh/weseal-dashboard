import type { Config } from "tailwindcss";

import baseConfig from "@repo/tailwind-config";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [...baseConfig.content, "node_modules/@repo/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
