import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'logo.png', 'robots.txt'],
      workbox: {
        globIgnores: ["bundle-report.html"],
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/api\//],
      },
      manifest: {
        name: 'Celestial Scrolls - Baca Novel Sub Indo',
        short_name: 'CelestialScrolls',
        description: 'Tempat baca novel bahasa indonesia.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    mode === "analyze" &&
    visualizer({
      filename: "dist/bundle-report.html",
      gzipSize: true,
      brotliSize: true,
      open: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
