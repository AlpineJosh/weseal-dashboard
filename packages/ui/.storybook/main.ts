import { dirname, join } from "path";
import type { StorybookConfig } from "@storybook/nextjs";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

const config: StorybookConfig = {
  stories: ["../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-actions",
    "@storybook/addon-viewport",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
    {
      name: "@storybook/addon-styling-webpack",
      options: {
        rules: [
          {
            test: /\.css$/,
            sideEffects: true,
            use: [
              require.resolve("style-loader"),
              {
                loader: require.resolve("css-loader"),
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: require.resolve("postcss-loader"),
                options: {
                  implementation: require.resolve("postcss"),
                },
              },
            ],
          },
        ],
      },
    },
  ],

  framework: "@storybook/nextjs",

  webpackFinal: async (config, { configType }) => {
    config.resolve = config.resolve || {};
    config.resolve.plugins = [new TsconfigPathsPlugin()];

    // config.module = config.module || {};
    // config.module.rules = config.module.rules || [];
    // config.module.rules.push({
    //   test: /\.css$/,
    //   use: ["style-loader", "css-loader", "postcss-loader"],
    //   include: join(__dirname, "../src"),
    // });
    return config;
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};
export default config;
