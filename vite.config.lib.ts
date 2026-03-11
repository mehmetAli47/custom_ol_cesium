import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Classic runtime avoids `react/jsx-runtime` subpath imports in output,
  // which improves compatibility with some Webpack ESM setups.
  plugins: [react({ jsxRuntime: "classic" })],
  build: {
    outDir: "dist-lib",
    lib: {
      entry: "src/lib/index.ts",
      formats: ["es"],
      fileName: () => "index.js",
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) => {
        if (id === "react" || id === "react-dom") return true;
        if (id.startsWith("react/") || id.startsWith("react-dom/")) return true;
        if (id === "cesium" || id.startsWith("cesium/")) return true;
        if (id === "ol" || id.startsWith("ol/")) return true;
        return false;
      },
    },
  },
});
