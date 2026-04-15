import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendBaseUrl = process.env.BACKEND_API_URL ?? "http://localhost:5000/api";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: __dirname,  // Add this line
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;