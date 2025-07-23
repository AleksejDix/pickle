import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "path";

// Check if we're building the library
const isLibBuild = process.env.LIB_BUILD === "true";

export default defineConfig({
  plugins: [
    vue(),
    ...(isLibBuild
      ? [
          dts({
            insertTypesEntry: true,
            include: ["lib/**/*.ts"],
            exclude: ["lib/**/*.test.ts", "lib/**/*.spec.ts"],
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "usetemporal": resolve(__dirname, "./lib"),
    },
  },
  ...(isLibBuild
    ? {
        build: {
          lib: {
            entry: resolve(__dirname, "lib/index.ts"),
            name: "useTemporal",
            formats: ["es"],
            fileName: () => "index.js",
          },
          rollupOptions: {
            external: ["vue", "date-fns", "luxon", "@vue/reactivity"],
            output: {
              globals: {
                vue: "Vue",
                "date-fns": "dateFns",
                luxon: "Luxon",
                "@vue/reactivity": "VueReactivity",
              },
            },
          },
        },
      }
    : {
        root: "./",
        server: {
          port: 3000,
        },
      }),
});