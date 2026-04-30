import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/place': {
        target: 'https://maps.googleapis.com/maps/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/place/, '/place'),
      },
      '/api/geocode': {
        target: 'https://maps.googleapis.com/maps/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geocode/, '/geocode'),
      },
    },
  },
})
