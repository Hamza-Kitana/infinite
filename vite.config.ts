import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("three")) return "three";
          if (id.includes("lucide-react")) return "icons";
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // طلبات Kick من نفس المنشأ في التطوير (تفادي CORS + بعض طلبات 403 بدون User-Agent)
      "/kick-api": {
        target: "https://kick.com",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/kick-api/, ""),
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            );
            proxyReq.setHeader("Accept", "application/json");
          });
        },
      },
      "/tiktok-api": {
        target: "https://www.tiktok.com",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/tiktok-api/, ""),
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            );
            proxyReq.setHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            proxyReq.setHeader("Accept-Language", "en-US,en;q=0.9");
          });
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
