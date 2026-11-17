import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const repositoryName = "clearplay-ai";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS === "true" ? `/${repositoryName}/` : "/",
  server: { port: 5173 },
  test: { environment: "jsdom" },
});
