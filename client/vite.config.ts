import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // keep or adjust
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        // optional but useful:
        // rewrite: (path) => path, // keep `/api` as-is
        // secure: false,           // only needed if https+self-signed
      },
    },
  },
});
