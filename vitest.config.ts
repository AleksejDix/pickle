/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "coverage/**",
        "dist/**",
        "test/**",
        "examples/**",
        "*.config.ts",
        "**/*.d.ts",
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/types/**",
        "src/**/index.ts",
        "src/**/types.ts",
      ],
    },
  },
});
