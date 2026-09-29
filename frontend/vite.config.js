/**
 * VigiRail web — Vite configuration.
 *
 * Dev:  the dev server proxies /api → FastAPI (no CORS needed locally).
 * Prod: requests go to the same origin; either put a rewrite in front
 *       (vercel.json) or set VITE_API_URL to the deployed API base.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const API_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:8000';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'VigiRail — Railway Asset Health',
        short_name: 'VigiRail',
        description:
          'Live railway asset health, failure-risk predictions and inspection reports.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#0a0f1a',
        theme_color: '#0a0f1a',
        categories: ['business', 'productivity', 'utilities'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell is precached; API calls always hit the network so live
        // telemetry is never served from cache. Offline → the shell loads and
        // the UI shows its connection banner.
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/healthz/, /^\/docs/, /^\/openapi/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.hostname.includes('fonts.gstatic.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    // Dev server is local-only in practice; allow tunnel/preview hosts.
    allowedHosts: true,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
      '/healthz': { target: API_TARGET, changeOrigin: true },
      '/docs': { target: API_TARGET, changeOrigin: true },
      '/openapi.json': { target: API_TARGET, changeOrigin: true },
    },
  },
  preview: {
    host: true,
    port: Number(process.env.PORT) || 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
