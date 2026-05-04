import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Share the offline detector with the Chrome extension. The same
      // detector.js + data.js power both clients; there is no second copy.
      "@switcher/detector": path.resolve(__dirname, "../extension/lib/detector.js"),
    },
  },
  server: {
    port: 5173,
    fs: {
      // Allow Vite's dev server to read the detector from outside web/.
      allow: [".."],
    },
    proxy: {
      "/api": "http://localhost:5050",
    },
  },
});
