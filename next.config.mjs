const isProduction = process.env.NODE_ENV === "production";

const nextConfig = {
    output: "export",
    basePath: isProduction ? "/geo-invaders" : "",
};

export default nextConfig;
