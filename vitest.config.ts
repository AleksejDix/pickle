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
      include: ["lib/**/*.ts"],
      exclude: [
        "coverage/**",
        "dist/**",
        "test/**",
        "src/**",
        "*.config.ts",
        "**/*.d.ts",
        "lib/**/*.test.ts",
        "lib/**/*.spec.ts",
        "lib/types/**",
        "lib/**/index.ts",
        "lib/**/types.ts",
      ],
    },
  },
});
