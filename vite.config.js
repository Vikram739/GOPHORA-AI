import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  // For GitHub Pages, set base to repo name if not using custom domain
  // Change 'Gophora-v2' to your actual repo name
  const base = mode === 'production' ? '/GOPHORA-v2/' : '/'
  
  return {
    base: base,
    plugins: [
      tailwindcss(),
      react()
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  }
})