import type { MetadataRoute } from "next";

const basePath = process.env.NODE_ENV === "production" ? "/geo-invaders" : "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Geo Invaders",
        short_name: "GeoInvaders",
        description:
            "An interactive map for exploring Flash Invaders street art.",
        start_url: `${basePath}/`,
        scope: `${basePath}/`,
        display: "standalone",
        orientation: "portrait",
        background_color: "#0b1220",
        theme_color: "#0b1220",
        lang: "en",
        icons: [
            {
                src: `${basePath}/icon.png`,
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: `${basePath}/icon.png`,
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: `${basePath}/apple-touch-icon.png`,
                sizes: "180x180",
                type: "image/png",
            },
        ],
    };
}
