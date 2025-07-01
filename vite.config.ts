import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 5173,
    allowedHosts: [
      "e5f0-2407-4d00-3c00-7ef9-f5a1-9d40-48b3-af85.ngrok-free.app"
    ],
  },
});
