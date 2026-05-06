import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Tells Next.js to trace files from the monorepo root so workspace packages
    // (packages/database, packages/shared, etc.) are included in the standalone bundle.
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};

export default nextConfig;
