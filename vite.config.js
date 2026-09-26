import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'snowflake.svg',
        'demo.db',
        'sql-wasm.js',
        'sql-wasm.wasm',
        'ocr/worker.min.js',
        'ocr/eng.traineddata.gz',
        'ocr/tesseract-core-simd-lstm.wasm.js',
        'ocr/tesseract-core-simd-lstm.wasm',
        'ocr/tesseract-core-lstm.wasm.js',
        'ocr/tesseract-core-lstm.wasm',
      ],
      manifest: {
        name: 'IceFast Warehouse',
        short_name: 'IceFast',
        description:
          'Open-source warehouse companion. Floor sheets, dispatch, yard temps, local on-device OCR.',
        theme_color: '#0b1f3a',
        background_color: '#071526',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/snowflake.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,wasm,gz,db,ico}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/ocr/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'icefast-ocr-engine',
              expiration: {
                maxEntries: 24,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Enable SW in `vite` so tablets can install/cache OCR during demo
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
