// jest.config.ts
import { createDefaultPreset, type JestConfigWithTsJest } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    ...tsJestTransformCfg,
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/app.ts',
    '!src/__tests__/**',
  ],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  maxWorkers: 1,
  testTimeout: 60000,
};

export default config;