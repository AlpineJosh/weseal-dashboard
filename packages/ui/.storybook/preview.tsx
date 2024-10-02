import type { Preview } from "@storybook/react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "../src/globals.css";

import React from "react";
import {
  DecoratorHelpers,
  withThemeByClassName,
  withThemeByDataAttribute,
} from "@storybook/addon-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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

      const globalClasses = [
        inter.variable,
        inter.className,
        "text-content",
        "bg-background",
        "font-sans",
      ];

      React.useEffect(() => {
        globalClasses.forEach((cls) => {
          document.documentElement.classList.add(cls);
        });

        return () => {
          globalClasses.forEach((cls) => {
            document.documentElement.classList.remove(cls);
          });
        };
      }, []);

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

  // tags: ["autodocs"],
};

export default preview;
