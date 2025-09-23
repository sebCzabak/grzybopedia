// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        // Ta linia "usuwa" /api z początku adresu przed wysłaniem do serwera Pythona
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})