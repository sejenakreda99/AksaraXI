import type {NextConfig} from 'next';

// Load environment variables from .env file
require('dotenv').config();

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
 ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // If we are on the server, we don't want to bundle the 'fs' module
    // as it's a Node.js built-in module and should be available at runtime.
    // However, if the build process is trying to access it in a way that
    // causes issues, we can try aliasing it to false.
    if (isServer) {
      config.resolve.alias.fs = false;
    }
    return config;
  },
  // Expose server-side environment variables to the Next.js server runtime.
  serverRuntimeConfig: {
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
};

export default nextConfig;
