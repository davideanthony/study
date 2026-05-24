import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    serverActions: {
      bodySizeLimit: "105mb",
    },
    proxyClientMaxBodySize: "105mb",
  },
};

export default nextConfig;
