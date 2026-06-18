import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const isProd = mode === "production";
  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://backend-api:8000",
          changeOrigin: true,
        },
      },
    },
    build: {
      // In non-production modes keep code readable and include source maps
      minify: isProd ? "esbuild" : false,
      sourcemap: !isProd,
    },
  };
});
