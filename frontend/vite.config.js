import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During development, requests to /api are forwarded to the Express backend
// on port 5000, so the browser only ever talks to one origin (no CORS pain).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
