import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// `base: './'` makes the production build use RELATIVE asset paths, so the app
// works when served from a GitHub Pages project sub-path (https://<user>.github.io/<repo>/)
// without hardcoding the repo name. Safe here because the app has no client-side
// routing. The PWA manifest/scope use relative paths ('.') for the same reason.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // new content is fetched and swapped in on next load
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'System Design Quiz',
        short_name: 'SD Quiz',
        description:
          'Practice system design, architecture archetypes, and MCP with explained multiple-choice questions.',
        theme_color: '#0f1117',
        background_color: '#0f1117',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache only the lightweight app shell. JS/CSS (hashed, immutable —
        // including the bundled question content and the heavy lazy Mermaid chunks)
        // are cached at runtime on first use, so the first visit stays light but the
        // quiz works fully offline afterwards, diagrams included.
        globPatterns: ['**/*.{css,html,svg,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' || request.destination === 'style',
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-assets',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: true, type: 'module' }, // lets us test the SW on the dev server
    }),
  ],
}))
