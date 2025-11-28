import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed ignoreDuringBuilds and ignoreBuildErrors
  // All TypeScript and ESLint errors must be fixed before production builds
  // This ensures code quality and prevents runtime errors
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'lucide-react',
      'chart.js',
      'react-chartjs-2',
      'yjs',
      'y-indexeddb',
    ],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
