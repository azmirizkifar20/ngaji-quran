import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
      VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Ngaji Quran',
        short_name: 'Ngaji Quran',
        description: 'Baca Quran + streak + goals khatam',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/verses\.quran\.foundation\/fonts\/quran\/hafs\/v4\/colrv1\/woff2\/p\d+\.woff2$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'qcf-tajweed-fonts',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/css2\?/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-styles',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/quran/page'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'quran-pages',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      }
    })
  ],
});
