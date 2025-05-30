/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['replicate.delivery'], // Allow images from Replicate CDN
    unoptimized: true, // Allow using local images without optimization
  },
  webpack: (config) => {
    config.resolve.extensions = ['.tsx', '.ts', '.js', '.jsx', ...config.resolve.extensions];
    return config;
  },
}

module.exports = nextConfig 