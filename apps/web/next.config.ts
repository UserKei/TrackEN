import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "../..");
const apiProxyOrigin = process.env.API_PROXY_ORIGIN ?? "http://localhost:3000";
const aiProxyOrigin = process.env.AI_PROXY_ORIGIN ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@en/common", "@en/config"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyOrigin}/api/:path*`,
      },
      {
        source: "/ai/:path*",
        destination: `${aiProxyOrigin}/ai/:path*`,
      },
    ];
  },
};

export default nextConfig;
