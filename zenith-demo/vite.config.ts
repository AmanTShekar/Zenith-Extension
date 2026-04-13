import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { zenithGhostId as zenith } from '../zenith-vite-plugin/src/index'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    zenith()
  ],
  server: {
    host: '127.0.0.1',
    port: 3009,
    strictPort: true,
  }
})
