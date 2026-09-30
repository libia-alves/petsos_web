import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mesmo alias "@/" usado no app mobile
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
