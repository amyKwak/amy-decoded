import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Evals call the real API, so they run separately from `npm test`.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["src/**/*.eval.ts"],
    env: loadEnv("", process.cwd(), ""),
    testTimeout: 180_000,
  },
});
