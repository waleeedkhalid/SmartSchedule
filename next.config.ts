import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
