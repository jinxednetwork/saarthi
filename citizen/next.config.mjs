/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@saarthi/shared"],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
