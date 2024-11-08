import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/lta-resource-management-app/',
  publicDir: 'public',
  server: {
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: 'dist',
  },
})
