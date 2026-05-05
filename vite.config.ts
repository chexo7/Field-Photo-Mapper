import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/')
          ) {
            return 'react-vendor';
          }
          if (
            normalizedId.includes('/node_modules/leaflet/') ||
            normalizedId.includes('/node_modules/react-leaflet/')
          ) {
            return 'map-vendor';
          }
          if (
            normalizedId.includes('/node_modules/dexie/') ||
            normalizedId.includes('/node_modules/jszip/') ||
            normalizedId.includes('/node_modules/@tmcw/')
          ) {
            return 'field-data-vendor';
          }
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'sample-data/sample-project.kml'],
      manifest: {
        name: 'Field Photo Mapper',
        short_name: 'Photo Mapper',
        description:
          'Collect GPS photos, KML/KMZ overlays, headings, notes, and field exports from a browser.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f7faf7',
        theme_color: '#0f5132',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'osm-runtime-tiles',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          }
        ]
      }
    })
  ]
});
