import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/login': 'http://localhost:3000',
      '/register': 'http://localhost:3000',
      '/logout': 'http://localhost:3000',
      '/dashboard': 'http://localhost:3000',
      '/workouts': 'http://localhost:3000',
      '/goals': 'http://localhost:3000',
      '/settings': 'http://localhost:3000',
      '/muscleGroup': 'http://localhost:3000',
      '/showRoutine': 'http://localhost:3000',
      '/getAndShowFavourites': 'http://localhost:3000',
      '/info': 'http://localhost:3000',
      '/about': 'http://localhost:3000'
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
