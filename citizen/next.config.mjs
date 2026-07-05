import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@saarthi/shared"],
  output: "standalone",
  experimental: {
    externalDir: true,
    // Trace files from the monorepo root (Next 14.2 keeps this experimental).
    outputFileTracingRoot: path.join(__dirname, ".."),
  },
};

export default nextConfig;
