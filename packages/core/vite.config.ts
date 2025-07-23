import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "composables/index": resolve(__dirname, "src/composables/index.ts"),
      },
      name: "useTemporal",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "@vue/reactivity",
        "@usetemporal/adapter-native",
        "@usetemporal/adapter-date-fns",
        "@usetemporal/adapter-luxon",
        "@usetemporal/adapter-temporal",
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
