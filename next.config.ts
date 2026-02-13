import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 200,
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Set a reasonable limit, e.g., '5mb'
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'anna-nextjs-dashboard-bucket.s3.eu-west-2.amazonaws.com', // The domain of your image
        port: '',
      },
    ],
  },
};

export default nextConfig;
