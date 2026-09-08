import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // --host permet de tester depuis le telephone sur le meme wifi
    port: 5173,
  },
})
