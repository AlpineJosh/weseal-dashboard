import * as tseslint from "typescript-eslint";

import baseConfig from "@repo/eslint-config/base";
import reactConfig from "@repo/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default tseslint.config(
  {
    ignores: [".storybook", "turbo", "dist"],
  },

  ...baseConfig,
  ...reactConfig,
);
