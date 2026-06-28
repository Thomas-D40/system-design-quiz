import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base: './'` makes the production build use RELATIVE asset paths, so the app
// works when served from a GitHub Pages project sub-path (https://<user>.github.io/<repo>/)
// without hardcoding the repo name. This is safe here because the app has no
// client-side routing (no deep links / no refresh-on-route). Dev stays at '/'.
//
// If you ever add client-side routing, switch to base: '/<repo-name>/' and add an
// SPA 404.html fallback.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
}))
