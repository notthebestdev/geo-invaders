import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
    output: "export",
    basePath: isProduction ? "/geo-invaders" : "",
};

export default nextConfig;
