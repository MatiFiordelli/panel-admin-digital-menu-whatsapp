// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Dev proxy mirrors the production rewrite in vercel.json, so the browser
// always talks to its own origin (same-origin => SameSite=Strict cookie works).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    proxy: {
      "/api": {
        target: "https://crud-base-api.vercel.app",
        changeOrigin: true,
        cookieDomainRewrite: "",
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Function form: works with both Rollup and Rolldown-based Vite.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return "react";
          if (/[\\/]node_modules[\\/](@tanstack|axios)[\\/]/.test(id)) return "data";
          if (/[\\/]node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/.test(id)) return "forms";
          return undefined;
        },
      },
    },
  },
});