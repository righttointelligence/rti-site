import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Simple static SPA. Build -> dist, deployed to Cloudflare Workers static assets.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
