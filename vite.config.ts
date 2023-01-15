import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import {VitePWA as vitePWA} from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    mkcert(),
    vitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /api/,
            handler: 'CacheFirst' as const,
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Disable code-splitting if so desired
        manualChunks: () => 'all',
      },
    },
  },
  server: {
    https: true,
    proxy: {
      '/api': {
        target: 'https://swapi.dev',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
