import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 200,
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
