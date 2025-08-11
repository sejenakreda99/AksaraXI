import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  runtime: 'nodejs',
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
};

export default nextConfig;
