import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // "Proxy": cuando el navegador pide /api/..., Vite reenvía la petición al
    // backend de NestJS (puerto 3000). Así el frontend y la API parecen estar
    // en el mismo sitio y no hay problemas de CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
