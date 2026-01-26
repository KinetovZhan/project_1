import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // опционально
    globals: true,
    css: true,
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}']
  },
})
