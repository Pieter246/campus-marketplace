import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  /* This is for auth-buttons */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ]
  }
};

export default nextConfig;
