import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
