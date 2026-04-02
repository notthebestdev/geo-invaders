// Use NODE_ENV to determine if this is a production build for GitHub Pages
// When NODE_ENV is "production", we're building for deployment to GitHub Pages
// Otherwise (including undefined/development), we're building for local testing
const isGitHubPagesBuild = process.env.NODE_ENV === "production";

const nextConfig = {
    output: "export",
    images: {
        unoptimized: true,
    },
    basePath: isGitHubPagesBuild ? "/geo-invaders" : "",
};

export default nextConfig;
