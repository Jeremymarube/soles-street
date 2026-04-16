import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendBaseUrl = process.env.BACKEND_API_URL ?? "http://localhost:5000/api";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // ❌ REMOVE this entire eslint block:
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  async rewrites() {
  return [
    {
      source: "/backend-api/:path*",
      destination: `${backendBaseUrl}/api/:path*`,
    },
  ];
},
};

export default nextConfig;