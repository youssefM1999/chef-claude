import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep favicon files in root without hashing
          if (assetInfo.names && assetInfo.names[0] && assetInfo.names[0].includes('chef-claude')) {
            return 'chef-claude.png'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
