import baseConfig from "@repo/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parserOptions: {
        project: true, // Let ESLint automatically find tsconfig files
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.test.ts", "**/__tests__/**"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.test.json", // Explicitly point to test config for test files
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Any specific rules for test files
    },
  },
];
