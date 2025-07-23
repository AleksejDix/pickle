import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["lib/**/*.ts"],
      exclude: ["lib/**/*.test.ts", "lib/**/*.spec.ts"],
    }),
  ],
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
});