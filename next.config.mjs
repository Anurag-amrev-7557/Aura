import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'remotive.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // Stub out the optional 'canvas' dependency used by pdfjs in server builds
    // to avoid native build requirements on Vercel.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: path.resolve(process.cwd(), 'src/lib/canvas-stub.js'),
    };
    return config;
  },
};

export default nextConfig;
