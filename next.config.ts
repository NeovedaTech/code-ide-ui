import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  logging: {
    incomingRequests:true
  },
};

export default nextConfig;
