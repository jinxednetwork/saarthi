/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Consume @saarthi/shared as raw TypeScript source from the workspace.
  transpilePackages: ["@saarthi/shared"],
  experimental: {
    // Allow importing from outside app/ (the monorepo root) during dev.
    externalDir: true,
  },
};

export default nextConfig;
