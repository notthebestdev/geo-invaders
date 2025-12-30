import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Viewport } from "next";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Geo Invaders",
    description: "An interactive map for the game Flash Invaders",
    keywords: ["Geo Invaders", "Flash Invaders", "interactive map", "street art", "game", "map"],
    authors: [{ name: "TheBestDeveloper" }],
    openGraph: {
        title: "Geo Invaders",
        description: "An interactive map for the game Flash Invaders",
        url: "https://notthebestdev.github.io/geo-invaders/",
        siteName: "Geo Invaders",
        images: [
            {
                url: "https://notthebestdev.github.io/geo-invaders/icon.png",
                width: 1200,
                height: 630,
                alt: "Geo Invaders Map",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Geo Invaders",
        description: "An interactive map for the game Flash Invaders",
        images: ["https://notthebestdev.github.io/geo-invaders/icon.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    icons: {
        icon: "/geo-invaders/icon.png",
        apple: "/geo-invaders/apple-touch-icon.png",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning
            >
                {children}
            </body>
        </html>
    );
}
