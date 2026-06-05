import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  define: {
    GOOGLE_MAPS_API_KEY: JSON.stringify('YOUR_GOOGLE_MAPS_API_KEY_HERE'),
  }
});

