import { defineConfig } from "vite";

// Simple static server and build for plain HTML/CSS/JS
export default defineConfig({
  server: {
    port: 5173,
    open: true,
    allowedHosts: true,
  },
  build: {
    target: "es2018",
  },
});

