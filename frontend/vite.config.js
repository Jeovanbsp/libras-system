import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Define que o '@' aponta para a pasta 'src'
      '@': path.resolve(__dirname, './src'),
    },
  },
})