import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
    // Allow any ngrok tunnel hostname to reach the dev server (the free
    // tier assigns a new random subdomain on each restart).
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.io'],
  },
});
