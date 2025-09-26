import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Always use local backend for proxy in dev
  const localApi = 'http://localhost:5000';
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: mode === 'development' ? localApi : env.VITE_API_BASE_URL.replace(/\/$/, ''),
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
