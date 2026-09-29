import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: false,
  },
  server: {
    proxy: {
      '/api/rapid-news': {
        target: 'https://video-game-news.p.rapidapi.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'x-rapidapi-key': '3ec0d35cffmshea515ccb9fd69f6p1b22e5jsn48fe1fe6a537',
          'x-rapidapi-host': 'video-game-news.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        rewrite: (path) => path.replace(/^\/api\/rapid-news/, '/all'),
      },
    },
  },
})
