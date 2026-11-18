import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
    // Always bundle a single copy of React. On Windows, differing drive-letter casing in the
    // working directory (c:\ vs C:\) can otherwise produce two copies and a blank app.
    dedupe: ["react", "react-dom"],
  },
  server: { port: 5180, open: false },
  // The app is served from the domain root ("/"). For a sub-path, build with: npx vite build --base=/sub-path/
  base: "/",
});
