import type { NextConfig } from "next";

const API_URL = process.env.API_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "play.pokemonshowdown.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
