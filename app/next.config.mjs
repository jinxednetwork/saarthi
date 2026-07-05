import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Consume @saarthi/shared as raw TypeScript source from the workspace.
  transpilePackages: ["@saarthi/shared"],
  // Self-contained server bundle for Cloud Run / Firebase App Hosting.
  output: "standalone",
  experimental: {
    // Allow importing from outside app/ (the monorepo root) during dev/build.
    externalDir: true,
    // Trace files from the monorepo root so workspace deps are included
    // (Next 14.2 keeps this under `experimental`).
    outputFileTracingRoot: path.join(__dirname, ".."),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
