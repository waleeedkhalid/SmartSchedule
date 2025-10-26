import type { NextConfig } from "next";

/**
 * Next.js Configuration - Performance Optimized
 * Following performance.md guidelines for maximum speed
 */
const nextConfig: NextConfig = {
  output: "standalone",
  
  // ✅ PERFORMANCE: Experimental features for optimization
  experimental: {
    // Enable parallel routes
    parallelServerCompiles: true,
  },

  // ✅ PERFORMANCE: Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60, // Cache images for 1 minute
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ✅ PERFORMANCE: Enable compression
  compress: true,

  // ✅ PERFORMANCE: Optimize production bundle
  productionBrowserSourceMaps: false, // Disable source maps in production
  
  // ✅ PERFORMANCE: PoweredByHeader removal for security & speed
  poweredByHeader: false,

  // ✅ PERFORMANCE: Optimize server components
  serverExternalPackages: ['@supabase/supabase-js'],

  // ✅ PERFORMANCE: Configure caching headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/data/:path*",
        destination: "/api/data/:path*",
      },
    ];
  },
};

export default nextConfig;
