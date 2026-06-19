import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import tailwindcss from "@tailwindcss/vite";
import wails from "@wailsio/runtime/plugins/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const outDirMap: Record<string, string> = {
    development: "dist/dev",
    production: "dist/prod",
  };
  const outDir = outDirMap[mode] || "dist/prod";

  return {
    plugins: [vue(), vueJsx(), tailwindcss(), wails("./bindings")],
    base: "./",
    server: {
      host: "0.0.0.0",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir,
    },
  };
});
