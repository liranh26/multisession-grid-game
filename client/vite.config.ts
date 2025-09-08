import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Allow importing from ../shared
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      "@shared": new URL("../shared", import.meta.url).pathname
    }
  }
})
