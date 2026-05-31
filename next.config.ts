import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "better-auth",
    "@better-auth/drizzle-adapter",
    "@better-auth/kysely-adapter",
    "kysely",
    "postgres",
  ],
};

export default nextConfig;
