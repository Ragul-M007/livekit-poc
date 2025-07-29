import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // or use your IP: '192.168.1.100'
    port: 5173 // default port, or any you like
  }
});
