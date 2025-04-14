
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    // Remove the lovable-tagger plugin that's causing ESM issues
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Make environment variables available to client-side code
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    // No need to manually expose VITE_* variables - Vite does this automatically
  }
}));
