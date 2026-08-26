import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/health': 'http://127.0.0.1:8000',
      '/predict': 'http://127.0.0.1:8000',
      '/model-info': 'http://127.0.0.1:8000',
      '/model-registry': 'http://127.0.0.1:8000',
      '/model-comparison': 'http://127.0.0.1:8000',
      '/model-health': 'http://127.0.0.1:8000',
      '/analytics': 'http://127.0.0.1:8000',
      '/bookings': 'http://127.0.0.1:8000',
      '/what-if': 'http://127.0.0.1:8000',
      '/validate-dataset': 'http://127.0.0.1:8000',
      '/copilot': 'http://127.0.0.1:8000',
      '/waitlist': 'http://127.0.0.1:8000',
      '/risk-topology': 'http://127.0.0.1:8000',
      '/cancellation-dna': 'http://127.0.0.1:8000',
      '/model-blind-zone': 'http://127.0.0.1:8000',
    }
  }
})
