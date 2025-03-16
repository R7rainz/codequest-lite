import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "localhost", // Allows access via localhost
    port: 5173, // Default Vite port, change if needed
    open: true, // Opens the browser on server start
    strictPort: true, // Ensures the server runs on the specified port or fails
    cors: true, // Enables CORS
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Change this if your backend runs on a different port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
