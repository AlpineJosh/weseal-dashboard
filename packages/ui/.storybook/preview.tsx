import type { Preview } from "@storybook/react";
import { ThemeProvider } from "next-themes";

import "../src/globals.css";

import React from "react";
import {
  DecoratorHelpers,
  withThemeByClassName,
  withThemeByDataAttribute,
} from "@storybook/addon-themes";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
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
    (Story, context) => {
      const theme = DecoratorHelpers.pluckThemeFromContext(context) ?? "light";
      return (
        <ThemeProvider
          attribute="class"
          themes={["light", "dark"]}
          defaultTheme={theme}
        >
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
