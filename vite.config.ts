import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react(), tailwindcss()],

    // 🔥 ESSENCIAL PRA VERCEL
    base: '/',

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },

    // 🔥 GARANTE BUILD LIMPO
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
  };
});