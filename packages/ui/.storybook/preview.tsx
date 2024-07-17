import type { Preview } from "@storybook/react";

import "../src/tailwind.css";

import React from "react";
import { withThemeByClassName } from "@storybook/addon-themes";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#fff" },
        { name: "dark", value: "#000" },
      ],
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    (Story) => (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-neutral-100 p-4 dark:bg-neutral-900">
        <Story />
      </div>
    ),
  ],
};

export default preview;
