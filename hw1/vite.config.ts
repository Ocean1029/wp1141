import { defineConfig } from "vite";

// Simple static server and build for plain HTML/CSS/TS
export default defineConfig({
  server: {
    port: 5173,
    open: true,
    allowedHosts: true,
  },
  build: {
    target: "es2018",
  },
  esbuild: {
    target: "es2018",
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});

