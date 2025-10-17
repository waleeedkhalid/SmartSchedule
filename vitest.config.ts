import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import "dotenv/config";

// Vitest configuration aligned with Next.js App Router docs
export default defineConfig(() => {
  // Load environment variables from .env, .env.local, .env.test, etc.
  // const { NEXT_PUBLIC_API_URL, NODE_ENV } = process.env;

  return {
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
      include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    },
  };
});
