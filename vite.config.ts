import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 8080,
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    lib: {
      entry: "src/index.ts",
      name: "useTemporal",
      fileName: (format) => `use-temporal.${format}.js`,
    },
    rollupOptions: {
      external: ["vue", "date-fns"],
      output: {
        globals: {
          vue: "Vue",
          "date-fns": "dateFns",
        },
      },
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "dist/",
        "**/*.d.ts",
        "vite.config.ts",
        "eslint.config.js",
        "tailwind.config.js",
        "postcss.config.js",
      ],
    },
  },
});
