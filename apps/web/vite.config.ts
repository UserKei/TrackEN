import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { Conifg } from "@en/config";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: Conifg.ports.web,
    proxy: {
      "/api": {
        target: `http://localhost:${Conifg.ports.server}`,
        changeOrigin: true,
      },
    },
  },
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
