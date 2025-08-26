import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Fail production builds on ESLint errors
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Fail production builds on TS errors
    ignoreBuildErrors: false,
  },
  turbopack: {
    // Configurações específicas do Turbopack
  },
};

export default nextConfig;
