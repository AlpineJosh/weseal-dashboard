// jest.config.ts
import type { JestConfigWithTsJest } from "ts-jest";
import { pathsToModuleNameMapper } from "ts-jest";

import { compilerOptions } from "./tsconfig.json";

export const jestConfig: JestConfigWithTsJest = {
  testEnvironment: "jsdom",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  collectCoverage: true,
  collectCoverageFrom: ["src/primitives/**/*.{ts,tsx}", "!**/*.stories.tsx"],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text", "text-summary", "lcov"],

  roots: ["<rootDir>"],
  modulePaths: [compilerOptions.baseUrl], // <-- This will be set to 'baseUrl' value
  moduleNameMapper: pathsToModuleNameMapper(
    compilerOptions.paths /*, { prefix: '<rootDir>/' } */,
  ),
};
export default jestConfig;
