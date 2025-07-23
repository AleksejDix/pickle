import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "useTemporalAdapterDateFns",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["@usetemporal/core", "date-fns"],
    },
  },
});
