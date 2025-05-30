/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['replicate.delivery'], // Allow images from Replicate CDN
    unoptimized: true, // Allow using local images without optimization
  },
  env: {
    // Expose environment variables to the browser
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
  webpack: (config) => {
    config.resolve.extensions = ['.tsx', '.ts', '.js', '.jsx', ...config.resolve.extensions];
    return config;
  },
}

module.exports = nextConfig 