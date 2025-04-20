import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  server: {
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5173
    },
    proxy: {
      '/issues': 'http://localhost:5050',
      '/webhook': 'http://localhost:5050',
      '/test-broadcast': 'http://localhost:5050'
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
