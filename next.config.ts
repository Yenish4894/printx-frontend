import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages (UI-only prototype, no server runtime)
  output: "export",
  images: { unoptimized: true },
  // Cloudflare Pages serves clean paths better with trailing slashes
  trailingSlash: true,
};

export default nextConfig;
