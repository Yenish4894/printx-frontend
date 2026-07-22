import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Fullstack Next app (server runtime) — hosts the API route handlers.
  // Deployed to Cloudflare Workers via the OpenNext adapter (@opennextjs/cloudflare).
  // `serverExternalPackages` keeps Prisma's runtime out of the server bundle so
  // the engine-free client resolves correctly.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon"],
};

// Makes the Cloudflare bindings (getCloudflareContext) available during `next dev`.
initOpenNextCloudflareForDev();

export default nextConfig;
